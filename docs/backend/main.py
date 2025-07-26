from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from llama_cpp import Llama
import requests
from bs4 import BeautifulSoup
import re
import spacy
nlp = spacy.load("en_core_web_sm")
try:
    import redis
except Exception:
    redis = None
import hashlib
import json
import logging
import os
import heapq
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bmn599.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SAWA-MEDICAL")

# Token management settings
CONTEXT_WINDOW = 1024
GENERATE_TOKENS = 200
MAX_PROMPT_TOKENS = CONTEXT_WINDOW - GENERATE_TOKENS  # 824 tokens
HISTORY_LIMIT = 1  # Only keep last exchange

# Initialize LLM with memory optimization
llm = None  # Initialize as None for error handling
try:
    model_path = os.getenv("MODEL_PATH", "models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf")
    if os.path.exists(model_path):
        llm = Llama(
            model_path=model_path,
            n_ctx=CONTEXT_WINDOW,
            n_threads=4,
            n_batch=512,
            use_mmap=False
        )
        logger.info(f"LLM model loaded: {model_path}")
    else:
        logger.error(f"Model file not found: {model_path}")
except Exception as e:
    logger.error(f"Model loading failed: {e}")

# Redis initialization
redis_client = None
if redis is not None:
    try:
        redis_client = redis.Redis(
            host='localhost',
            port=6379,
            db=0,
            socket_connect_timeout=3,
            socket_timeout=3,
            retry_on_timeout=True,
            max_attempts=3
        )
        redis_client.ping()
        logger.info("Redis connected")
    except Exception as e:
        redis_client = None
        logger.warning(f"Redis disabled: {e}")

CACHE_TTL = 60 * 60 * 24  # 24 hours

# Medical Knowledge Hub - Lightweight Access System
MEDICAL_KNOWLEDGE_HUB = {
    "guidelines": "https://clinicaltrials.gov/api/query/study_fields?expr=",
    "drugs": "https://api.fda.gov/drug/label.json?search=",
    "research": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=",
    "general": "https://medlineplus.gov/api/v2/page?query="
}

# Knowledge Snippet Cache
knowledge_cache = {}

# Medical shorthand mapping
MEDICAL_SHORTHAND = {
    "a": "atrial fibrillation", "v": "ventricular tachycardia",
    "h": "hypertension", "d": "diabetes", "c": "chest pain",
    "s": "shortness of breath", "p": "pulmonary embolism",
    "t": "troponin", "k": "potassium", "n": "sodium",
    "b": "blood pressure", "r": "respiratory rate"
}

MEDICAL_ACRONYMS = {
    "mi": "myocardial infarction", "chf": "congestive heart failure",
    "copd": "chronic obstructive pulmonary disease", "aki": "acute kidney injury",
    "pe": "pulmonary embolism", "svt": "supraventricular tachycardia",
    "vt": "ventricular tachycardia", "af": "atrial fibrillation",
    "inr": "international normalized ratio", "hr": "heart rate",
    "rr": "respiratory rate", "o2": "oxygen saturation",
    "uti": "urinary tract infection", "copd": "chronic obstructive pulmonary disease",
    "gerd": "gastroesophageal reflux disease", "ibd": "inflammatory bowel disease"
}

# Enhanced safe content handling
def safe_content(text, max_len=120):
    """Ensure clean, truncated string output with clinical context preservation"""
    if not text or not isinstance(text, str):
        return ""
    
    # Remove control chars but keep clinical symbols
    clean = re.sub(r'[^\x20-\x7E]', '', text)  # Keep printable ASCII
    
    # Collapse whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    # Preserve clinical context in truncation
    clinical_terms = '|'.join(list(MEDICAL_SHORTHAND.values()) + list(MEDICAL_ACRONYMS.values()))
    if re.search(clinical_terms, clean, re.IGNORECASE):
        matches = list(re.finditer(clinical_terms, clean, re.IGNORECASE))
        if matches:
            # Focus on first clinical term found
            start_idx = max(0, matches[0].start() - 20)
            end_idx = min(len(clean), matches[0].end() + 20)
            clean = clean[start_idx:end_idx]
    
    if len(clean) > max_len:
        return clean[:max_len] + '...'
    return clean

# Cache function with safe content
def cache_lookup(key, fetch_func, *args, **kwargs):
    if not redis_client:
        return fetch_func(*args, **kwargs)
    
    cache_key = f"cache:{key}:{hashlib.sha256(json.dumps(args, sort_keys=True).encode()).hexdigest()}"
    try:
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Cache lookup failed: {e}")
    
    result = fetch_func(*args, **kwargs)
    
    try:
        # Apply safety before caching
        if isinstance(result, tuple) and len(result) == 2:
            result = (safe_content(result[0]), result[1])
        elif isinstance(result, list):
            result = [safe_content(item) if isinstance(item, str) else item for item in result]
        elif isinstance(result, str):
            result = safe_content(result)
        
        redis_client.setex(cache_key, CACHE_TTL, json.dumps(result))
    except Exception as e:
        logger.warning(f"Cache set failed: {e}")
    
    return result

# Request model with validation
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=300)
    history: list = Field(default=[], max_items=5)

# Robust minimal input handler
def handle_minimal_input(user_input: str) -> tuple[str, list]:
    """Process ultra-short medical inputs with fallbacks"""
    # Single-character medical shorthand
    if len(user_input) == 1:
        expanded = MEDICAL_SHORTHAND.get(user_input.lower())
        if expanded:
            return expanded, [{
                "desc": "Shorthand Decoded",
                "content": f"Interpreted '{user_input}' as '{expanded}'",
                "url": None
            }]
    
    # Medical acronyms/abbreviations (2-3 chars)
    elif len(user_input) <= 3:
        expanded = MEDICAL_ACRONYMS.get(user_input.lower())
        if expanded:
            return expanded, [{
                "desc": "Acronym Expanded",
                "content": f"Expanded '{user_input}' to '{expanded}'",
                "url": None
            }]
    
    return user_input, []

# Enhanced key term extraction
def extract_key_terms(text):
    if not isinstance(text, str) or not text.strip():
        return []
    
    try:
        doc = nlp(text)
        terms = set()
        
        # Extract noun chunks and entities
        for chunk in doc.noun_chunks:
            if 3 < len(chunk.text) < 50:  # Reasonable length constraint
                terms.add(chunk.text.lower())
        
        for ent in doc.ents:
            if ent.label_ in ["DISEASE", "SYMPTOM", "DRUG", "ORG"] and 3 < len(ent.text) < 50:
                terms.add(ent.text.lower())
        
        # Add clinical abbreviations
        abbrevs = re.findall(r'\b[a-zA-Z]{2,4}\b', text)
        for abbr in abbrevs:
            if abbr.lower() in MEDICAL_ACRONYMS:
                terms.add(abbr.lower())
        
        return list(terms)[:5]  # Return top 5 terms
    except Exception as e:
        logger.error(f"Term extraction error: {e}")
        return []

# Medical Knowledge Access Functions
def fetch_medical_snippet(topic: str, source_type: str = "general") -> str:
    """Retrieve concise medical knowledge snippet"""
    cache_key = f"{source_type}:{topic}"
    if cache_key in knowledge_cache:
        return knowledge_cache[cache_key]
    
    try:
        url = MEDICAL_KNOWLEDGE_HUB[source_type] + requests.utils.quote(topic)
        response = requests.get(url, timeout=2.5)  # Strict timeout
        
        if response.status_code != 200:
            return ""
        
        # Process based on source type
        if source_type == "general":
            data = response.json().get("results", [{}])
            if data:
                snippet = data[0].get("body", [{}])[0].get("text", "")[:300]
            else:
                snippet = ""
        elif source_type == "drugs":
            results = response.json().get("results", [{}])
            snippet = results[0].get("indications_and_usage", [""])[0][:300] if results else ""
        elif source_type == "guidelines":
            data = response.json().get("StudyFieldsResponse", {})
            studies = data.get("StudyFields", [])
            snippet = studies[0].get("BriefTitle", [""])[0][:300] if studies else ""
        elif source_type == "research":
            data = response.json().get("esearchresult", {})
            id_list = data.get("idlist", [])
            snippet = f"PubMed ID: {id_list[0]}" if id_list else ""
        
        # Safe processing
        clean_snippet = safe_content(snippet, 100) if snippet else ""
        knowledge_cache[cache_key] = clean_snippet
        return clean_snippet
    except Exception as e:
        logger.warning(f"Knowledge fetch failed: {e}")
        return ""

def expand_medical_terms(terms: list) -> list:
    """Expand terms to related medical concepts"""
    expanded = set(terms)
    for term in terms:
        doc = nlp(term)
        for token in doc:
            # Expand with hypernyms (broader categories)
            if token.dep_ == "ROOT":
                expanded.add(token.lemma_)
                for ancestor in token.ancestors:
                    expanded.add(ancestor.lemma_)
            
            # Expand with hyponyms (specific subtypes)
            for child in token.children:
                if child.dep_ in ("dobj", "nsubj", "attr"):
                    expanded.add(child.lemma_)
    return list(expanded)[:5]  # Keep manageable

def fuse_medical_knowledge(user_input: str) -> str:
    """Combine multiple knowledge sources into concise insight"""
    terms = extract_key_terms(user_input)
    if not terms:
        return ""
    
    expanded_terms = expand_medical_terms(terms)
    
    # Priority: Guidelines > Research > Drugs > General
    knowledge_snippets = []
    for source in ["guidelines", "research", "drugs", "general"]:
        for term in expanded_terms:
            snippet = fetch_medical_snippet(term, source)
            if snippet and len(snippet) > 10:
                knowledge_snippets.append(snippet)
            if len(knowledge_snippets) >= 3:  # Don't collect too many
                break
        if len(knowledge_snippets) >= 3:
            break
    
    if not knowledge_snippets:
        return ""
    
    # Select most relevant snippet
    return heapq.nlargest(
        1, 
        knowledge_snippets, 
        key=lambda s: len(set(extract_key_terms(s)) & set(terms))
    )[0]

# API functions with enhanced error handling
def _lookup_dictionary(term):
    try:
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{term}"
        response = requests.get(url, timeout=3)  # Reduced timeout
        response.raise_for_status()
        
        # Handle rate limiting
        if response.status_code == 429:
            logger.warning("Dictionary API rate limited")
            return None
            
        js = response.json()
        if isinstance(js, list) and js:
            for meaning in js[0].get("meanings", []):
                for definition in meaning.get("definitions", []):
                    if definition.get("definition"):
                        return definition["definition"]
        return None
    except Exception as e:
        logger.error(f"Dictionary lookup error: {e}")
        return None

def lookup_dictionary(term):
    return cache_lookup("dict", _lookup_dictionary, term)

def _scrape_trusted_health_site(query):
    try:
        search_url = f"https://medlineplus.gov/search/?query={requests.utils.quote(query)}"
        resp = requests.get(search_url, timeout=5)  # Reduced timeout
        resp.raise_for_status()
        
        # Check for empty results
        if "No results found" in resp.text:
            return None, None
            
        soup = BeautifulSoup(resp.text, "html.parser")
        link = soup.find("a", class_="results-link")
        if link and link.get("href"):
            page_url = "https://medlineplus.gov" + link.get("href")
            
            # Skip PDF links
            if page_url.endswith(".pdf"):
                return None, None
                
            page = requests.get(page_url, timeout=5)
            page.raise_for_status()
            page_soup = BeautifulSoup(page.text, "html.parser")
            
            # Focus on main content
            content_div = page_soup.find("div", id="main-content") or page_soup.find("div", class_="main-content")
            if content_div:
                # Remove non-content elements
                for elem in content_div.find_all(["script", "style", "footer"]):
                    elem.decompose()
                    
                text = content_div.get_text(separator=" ", strip=True)
                return text, page_url
        return None, None
    except Exception as e:
        logger.error(f"MedlinePlus error: {e}")
        return None, None

def scrape_trusted_health_site(query):
    return cache_lookup("medlineplus", _scrape_trusted_health_site, query)

# Enhanced grounding with clinical prioritization
def build_grounding(user_input):
    sources = []
    
    # 1. Fused knowledge snippet (multi-source)
    fused_knowledge = fuse_medical_knowledge(user_input)
    if fused_knowledge:
        sources.append({
            "desc": "Medical Knowledge Hub",
            "content": fused_knowledge,
            "url": ""
        })
    
    # 2. Trusted health sites
    try:
        content, url = scrape_trusted_health_site(user_input)
        if content:
            sources.append({
                "desc": "MedlinePlus",
                "content": safe_content(content, 100),
                "url": url
            })
    except Exception as e:
        logger.error(f"MedlinePlus error: {e}")
    
    # 3. Dictionary definitions for key terms
    terms = extract_key_terms(user_input)
    if terms and len(sources) < 3:
        definition = lookup_dictionary(terms[0])
        if definition:
            sources.append({
                "desc": "Dictionary",
                "content": safe_content(definition, 80),
                "url": None
            })
    
    return sources[:3]  # Max 3 sources

# Clinical prompt builder
def build_prompt(history, user_input, sources):
    # Clinical system message
    system = (
        "You are a clinical expert. Provide concise, evidence-based responses.\n"
        "Format:\n"
        "**Summary**: 1-2 sentence clinical action\n"
        "**Recommendations**: Step-by-step management\n"
        "**Monitoring**: Key parameters to watch\n\n"
        "[Relevant Knowledge]:\n"
    )
    
    # Add sources with clinical relevance
    for i, source in enumerate(sources, 1):
        system += f"[{i}] {source['content']}\n"
    
    # Clinical history context
    chat = ""
    for turn in history[-HISTORY_LIMIT:]:
        user_msg = turn.get('user', '')[:70] 
        ai_msg = turn.get('ai', '')[:70]
        chat += f"User: {user_msg}\nAI: {ai_msg}\n"
    
    return system + f"\nUser: {user_input[:150]}\nAI:"

# Safe token counting
def safe_token_count(prompt):
    if not llm:
        return len(prompt) // 4
    
    try:
        tokens = llm.tokenize(prompt.encode("utf-8"))
        return len(tokens)
    except Exception as e:
        logger.warning(f"Token count error: {e}")
        return len(prompt) // 4

# Smart prompt trimming with clinical priority
def prepare_prompt_and_trim(history, user_input, sources):
    prompt = build_prompt(history, user_input, sources)
    token_count = safe_token_count(prompt)
    
    # Trim strategy (preserve clinical sources)
    while token_count > MAX_PROMPT_TOKENS:
        # 1. Trim history first
        if history:
            history = history[:-1]  # Remove oldest history
        # 2. Remove non-clinical sources
        elif sources and len(sources) > 1:
            non_clinical = [s for s in sources if s['desc'] in ["Dictionary", "Wikipedia"]]
            if non_clinical:
                sources.remove(non_clinical[0])
            else:
                sources.pop()  # Remove last source
        # 3. Truncate user input
        elif len(user_input) > 50:
            user_input = user_input[:40] + "..."
        # 4. Finally truncate prompt
        else:
            prompt = prompt[:500] + "..."
            break
        
        # Rebuild and recount
        prompt = build_prompt(history, user_input, sources)
        token_count = safe_token_count(prompt)
    
    logger.info(f"Final token count: {token_count}/{MAX_PROMPT_TOKENS}")
    return prompt

# Enhanced clinical responses for minimal inputs
MINIMAL_RESPONSES = {
    "k": (
        "**Potassium (K+) Management**\n"
        "- Normal: 3.5-5.0 mmol/L\n"
        "- Hypokalemia:\n"
        "  • Mild (3.1-3.5): 20-40mmol PO KCl\n"
        "  • Moderate (2.5-3.0): 20-40mmol IV over 4h\n"
        "  • Severe (<2.5): 10-20mmol/h IV + cardiac monitor\n"
        "- Hyperkalemia:\n"
        "  • K+>6.0: Calcium gluconate 1g IV\n"
        "  • K+>5.5: Insulin 10U + D50 + albuterol\n"
        "  • K+>5.0: Sodium zirconium cyclosilicate\n"
        "- ECG Changes: Peaked T-waves → PR prolongation → QRS widening"
    ),
    "inr": (
        "**INR Management**\n"
        "- Therapeutic: 2.0-3.0 (most indications)\n"
        "- Critical Values:\n"
        "  • <1.5: Thrombotic risk\n"
        "  • >5.0: Major bleed risk\n"
        "- Correction:\n"
        "  | INR    | Intervention               |\n"
        "  |--------|----------------------------|\n"
        "  | 5-9    | Hold 1-2 doses + Vit K1 1-2mg PO |\n"
        "  | >9     | Vit K 2.5-5mg IV + PCC 25-50U/kg |\n"
        "- DOACs preferred over warfarin when appropriate"
    ),
    "hr": (
        "**Heart Rate Evaluation**\n"
        "**Tachycardia (HR>100):**\n"
        "- Stable SVT: Adenosine 6mg rapid IV → 12mg\n"
        "- Stable AFib: Diltiazem 0.25mg/kg IV over 2min\n"
        "- Unstable: Synchronized cardioversion (start 100J)\n\n"
        "**Bradycardia (HR<60):**\n"
        "- Symptomatic: Atropine 0.5mg IV q3-5min (max 3mg)\n"
        "- High-grade AV block: Transcutaneous pacing\n"
        "- Refractory: Epinephrine 2-10mcg/min infusion"
    ),
    "bp": "**Blood Pressure Management**\n- Normal: <120/<80\n- Stage 1 HTN: 130-139/80-89\n- Stage 2 HTN: ≥140/90\n- Hypertensive urgency: Reduce MAP by 10-15% in first hour",
    "rr": "**Respiratory Rate Interpretation**\n- Normal: 12-20/min\n- Tachypnea (>20): Consider PE, pneumonia, acidosis\n- Bradypnea (<12): Consider opioid OD, CNS lesion",
    "fever": "**Fever Workup**\n1. Source identification\n2. Cultures before antibiotics\n3. Consider viral vs bacterial\n4. Risk-stratify for sepsis (qSOFA)",
    "glucose": "**Glucose Management**\n- Hypoglycemia: <70 mg/dL (15g carbs)\n- Hyperglycemia: >180 mg/dL (adjust insulin)\n- DKA: Glucose>250 + anion gap + ketones",
    "pain": "**Pain Management**\n1. Non-opioids (NSAIDs, acetaminophen)\n2. Weak opioids (tramadol)\n3. Strong opioids (morphine)\n+ Adjuvants for neuropathic pain",
    "rash": "**Rash Evaluation**\n- Macular: Viral, drug reaction\n- Papular: Folliculitis, acne\n- Vesicular: Herpes, shingles\n- Purpuric: Vasculitis, meningococcemia",
    "diarrhea": "**Diarrhea Management**\n- Acute: Supportive care + hydration\n- Infectious: C. diff (vancomycin), Giardia (metronidazole)\n- Chronic: Consider IBS, IBD, malabsorption"
}

# Health check endpoint
@app.get("/health")
def health_check():
    status = {
        "status": "operational" if llm else "degraded",
        "llm_loaded": bool(llm),
        "redis_available": bool(redis_client),
        "context_window": CONTEXT_WINDOW,
        "knowledge_sources": list(MEDICAL_KNOWLEDGE_HUB.keys())
    }
    return status

# Main endpoint with enhanced error handling
@app.post("/chat")
def chat(req: ChatRequest):
    try:
        # Check if LLM is loaded
        if not llm:
            return {"error": "AI model not available", "detail": "LLM failed to initialize"}
        
        user_input = req.message.strip()
        history = req.history or []
        
        logger.info(f"Received query: {user_input}")
        
        # Handle minimal inputs
        if len(user_input) <= 3:
            lc_input = user_input.lower()
            if lc_input in MINIMAL_RESPONSES:
                return {"reply": MINIMAL_RESPONSES[lc_input]}
            
            # Expand medical shorthand
            processed_input, _ = handle_minimal_input(user_input)
            if processed_input != user_input:
                return {"reply": f"Interpreting '{user_input}' as '{processed_input}'. Please provide more details."}
        
        # Build clinical context
        sources = build_grounding(user_input)
        logger.info(f"Using {len(sources)} sources")
        
        # Prepare token-safe prompt
        prompt = prepare_prompt_and_trim(history, user_input, sources)
        
        # Generate response
        output = llm(
            prompt,
            max_tokens=GENERATE_TOKENS,
            stop=["User:", "AI:", "###"],
            temperature=0.3,  # More deterministic
            repeat_penalty=1.2  # Reduce repetition
        )
        
        reply = output["choices"][0]["text"].strip()
        
        # Post-process for clinical relevance
        if "**Summary**" not in reply:
            first_period = reply.find('.')
            if first_period != -1:
                summary = reply[:first_period+1]
                details = reply[first_period+1:]
                reply = f"**Summary**: {summary}\n\n**Details**: {details}"
            else:
                reply = f"**Summary**: {reply}"
        
        return {"reply": reply}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error: {e}")
        return {"error": "Medical knowledge services unavailable"}
    except Exception as e:
        logger.exception("Critical chat error")
        return {"error": "Clinical processing failed", "detail": str(e)}
