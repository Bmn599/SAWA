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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bmn599.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Token management settings
CONTEXT_WINDOW = 1024
GENERATE_TOKENS = 200
MAX_PROMPT_TOKENS = CONTEXT_WINDOW - GENERATE_TOKENS  # 824 tokens
HISTORY_LIMIT = 1  # Only keep last exchange

# Initialize LLM with memory optimization
try:
    model_path = os.getenv("MODEL_PATH", "models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf")
    llm = Llama(
        model_path=model_path,
        n_ctx=CONTEXT_WINDOW,
        n_threads=4,
        n_batch=512,
        use_mmap=False
    )
    logger.info(f"LLM model loaded: {model_path}")
except Exception as e:
    logger.error(f"Model loading failed: {e}")
    raise RuntimeError("Model initialization error") from e

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
    "rr": "respiratory rate", "o2": "oxygen saturation"
}

# Safe content handling
def safe_content(text, max_len=120):
    """Ensure clean, truncated string output"""
    if not text or not isinstance(text, str):
        return ""
    
    # Remove control chars and non-ASCII
    clean = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', text)
    clean = clean.encode('ascii', 'ignore').decode('ascii')
    
    # Collapse whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    # Smart truncation with clinical term preservation
    clinical_terms = '|'.join(list(MEDICAL_SHORTHAND.values()) + list(MEDICAL_ACRONYMS.values()))
    if re.search(clinical_terms, clean, re.IGNORECASE):
        # Preserve clinical context in truncation
        matches = re.finditer(clinical_terms, clean, re.IGNORECASE)
        positions = [match.start() for match in matches]
        if positions:
            start = max(0, min(positions) - 20)
            end = min(len(clean), max(positions) + 20)
            clean = clean[start:end]
    
    return clean[:max_len] + ('...' if len(clean) > max_len else '')

# Cache function with safe content
def cache_lookup(key, fetch_func, *args, **kwargs):
    cache_key = f"cache:{key}:{hashlib.sha256(json.dumps(args, sort_keys=True).encode()).hexdigest()}"
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            logger.warning(f"Cache miss: {e}")
    
    result = fetch_func(*args, **kwargs)
    
    # Apply safety before caching
    if isinstance(result, tuple):
        result = (safe_content(result[0]), result[1])
    elif isinstance(result, list):
        result = [safe_content(item) if isinstance(item, str) else item for item in result]
    elif isinstance(result, str):
        result = safe_content(result)
    
    if redis_client and result:
        try:
            redis_client.setex(cache_key, CACHE_TTL, json.dumps(result))
        except Exception as e:
            logger.warning(f"Cache set fail: {e}")
    return result

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model with validation
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=300)
    history: list = Field(default=[], max_items=5)

# Minimal input handler
def handle_minimal_input(user_input: str) -> tuple[str, list]:
    """Process ultra-short medical inputs"""
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

# Key term extraction
def extract_key_terms(text):
    if not isinstance(text, str) or not text.strip():
        return []
    try:
        doc = nlp(text)
        terms = set()
        for chunk in doc.noun_chunks:
            if len(chunk.text) > 3:
                terms.add(chunk.text.lower())
        for ent in doc.ents:
            if len(ent.text) > 3:
                terms.add(ent.text.lower())
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        terms.update(words)
        return list(terms)[:5]
    except Exception:
        return []

# API functions with safe content
def _lookup_dictionary(term):
    try:
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{term}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        js = response.json()
        if isinstance(js, list) and js:
            meanings = js[0].get("meanings", [])
            if meanings:
                defs = meanings[0].get("definitions", [])
                if defs:
                    return defs[0].get("definition", "")
        return None
    except Exception as e:
        logger.error(f"Dictionary error: {e}")
        return None

def lookup_dictionary(term):
    return cache_lookup("dict", _lookup_dictionary, term)

def _scrape_trusted_health_site(query):
    try:
        search_url = f"https://medlineplus.gov/search/?query={requests.utils.quote(query)}"
        resp = requests.get(search_url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        link = soup.find("a", class_="results-link")
        if link and link.get("href"):
            page_url = "https://medlineplus.gov" + link.get("href")
            page = requests.get(page_url, timeout=10)
            page.raise_for_status()
            page_soup = BeautifulSoup(page.text, "html.parser")
            content = page_soup.find("div", class_="main-content")
            if content:
                text = " ".join(content.stripped_strings)
                return text, page_url
        return None, None
    except Exception as e:
        logger.error(f"MedlinePlus error: {e}")
        return None, None

def scrape_trusted_health_site(query):
    return cache_lookup("medlineplus", _scrape_trusted_health_site, query)

# Core grounding function
def build_grounding(user_input):
    sources = []
    
    # Essential hardcoded guidelines
    sources.append({
        "desc": "AHA/ACC/HFSA",
        "content": "2022 HF: Cardioversion for unstable AFib (Class I)",
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000941"
    })
    
    # Single external source
    source_priority = [
        ("MedlinePlus", lambda: scrape_trusted_health_site(user_input)),
        ("CDC", lambda: ("CDC health advisory", "https://cdc.gov")),  # Simplified for example
        ("Wikipedia", lambda: (f"Wikipedia summary for {user_input[:20]}", 
                              f"https://en.wikipedia.org/wiki/{user_input.replace(' ', '_')}"))
    ]
    
    for name, fetcher in source_priority:
        try:
            result = fetcher()
            if result and result[0]:
                content, url = result if isinstance(result, tuple) else (result, None)
                safe_text = safe_content(content, 100)
                if safe_text:
                    sources.append({
                        "desc": name,
                        "content": safe_text,
                        "url": url
                    })
                    logger.info(f"Used source: {name}")
                    break  # Only one external source
        except Exception as e:
            logger.warning(f"Source {name} skipped: {e}")
            continue
    
    return sources

# Token-safe prompt builder
def build_prompt(history, user_input, sources):
    # Compact system message
    system = (
        "Medical AI: Evidence-based answers.\n"
        "Format:\n"
        "**Summary**: Concise clinical action\n"
        "**Protocol**: Step-by-step management\n"
        "**Monitoring**: Key parameters\n\n"
        "[Knowledge]:\n"
    )
    
    # Add sources
    for i, source in enumerate(sources, 1):
        system += f"[{i}] {source['content']}\n"
    
    # History context
    chat = ""
    for turn in history[-HISTORY_LIMIT:]:
        chat += f"User: {turn['user'][:80]}\nAI: {turn['ai'][:80]}\n"
    
    return system + f"\nUser: {user_input[:200]}\nAI:"

# Token counting with fallback
def safe_token_count(llm, prompt):
    try:
        return len(llm.tokenize(prompt.encode("utf-8")))
    except Exception:
        return len(prompt) // 4  # Fallback estimation

# Smart prompt trimming
def prepare_prompt_and_trim(history, user_input, sources):
    prompt = build_prompt(history, user_input, sources)
    token_count = safe_token_count(llm, prompt)
    iterations = 0
    
    while token_count > MAX_PROMPT_TOKENS and iterations < 5:
        iterations += 1
        
        # Trim history first
        if len(history) > 0:
            history = history[1:]
        
        # Remove least important source
        elif sources and len(sources) > 1:
            non_guidelines = [s for s in sources if "AHA" not in s["desc"]]
            if non_guidelines:
                sources.remove(non_guidelines[0])
            else:
                sources.pop(0)
        
        # Truncate user input
        elif len(user_input) > 50:
            user_input = user_input[:40] + "..."
        
        # Rebuild prompt
        prompt = build_prompt(history, user_input, sources)
        token_count = safe_token_count(llm, prompt)
    
    # Final truncation if needed
    if token_count > MAX_PROMPT_TOKENS:
        prompt = prompt[:500] + "..."
    
    logger.info(f"Tokens: {token_count}/{MAX_PROMPT_TOKENS}")
    return prompt

# Response templates for minimal inputs
MINIMAL_RESPONSES = {
    "k": (
        "**Potassium (K+) Protocol**\n"
        "- Normal: 3.5-5.0 mmol/L\n"
        "- Critical: <3.0 or >5.5\n"
        "Hypokalemia:\n"
        "• Mild (3.0-3.5): 20-40mmol PO\n"
        "• Severe (<3.0): 10-20mmol/hr IV\n\n"
        "Hyperkalemia:\n"
        "• K+>6.0: Calcium gluconate 1g IV\n"
        "• K+>5.5: Insulin 10U + D50\n"
        "• Monitor ECG for peaked T-waves"
    ),
    "inr": (
        "**INR Management**\n"
        "- Therapeutic: 2.0-3.0 (AFib), 2.5-3.5 (valves)\n"
        "- Critical: >5.0 (bleed risk), <1.5 (clot risk)\n\n"
        "Correction:\n"
        "| INR   | Intervention          |\n"
        "|-------|-----------------------|\n"
        "| 5-9   | Hold warfarin + Vit K1 1-2mg PO |\n"
        "| >9    | Vit K 2.5-5mg IV + PCC |"
    ),
    "hr": (
        "**Tachy/Brady Protocol**\n"
        "Tachycardia (HR>100):\n"
        "• Stable SVT: Adenosine 6mg IV\n"
        "• Stable AFib: Diltiazem 0.25mg/kg\n"
        "• Unstable: Synchronized cardioversion\n\n"
        "Bradycardia (HR<60):\n"
        "• Symptomatic: Atropine 0.5mg IV\n"
        "• Complete HB: Transcutaneous pacing"
    )
}

# Main endpoint
@app.post("/chat")
def chat(req: ChatRequest):
    try:
        user_input = req.message.strip()
        history = req.history
        
        # Handle minimal inputs
        if len(user_input) <= 3:
            # Check for predefined responses
            if user_input.lower() in MINIMAL_RESPONSES:
                return {"reply": MINIMAL_RESPONSES[user_input.lower()]}
            
            # Expand medical shorthand
            processed_input, shorthand_sources = handle_minimal_input(user_input)
            if processed_input != user_input:
                return {"reply": f"Interpreting '{user_input}' as '{processed_input}'. Please provide more clinical context."}
        
        # Process standard inputs
        processed_input = user_input
        sources = build_grounding(processed_input)
        prompt = prepare_prompt_and_trim(history, processed_input, sources)
        
        # Generate response
        output = llm(prompt, max_tokens=GENERATE_TOKENS, stop=["User:", "AI:"])
        reply = output["choices"][0]["text"].strip()
        
        return {"reply": reply}
    except Exception as e:
        logger.exception("Chat error")
        return {"error": f"Processing error: {str(e)}"}

# Run with: uvicorn app:app --reload
