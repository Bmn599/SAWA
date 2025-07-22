from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

CONTEXT_WINDOW = 1024
GENERATE_TOKENS = 400
MAX_PROMPT_TOKENS = CONTEXT_WINDOW - GENERATE_TOKENS
HISTORY_LIMIT = 3

llm = Llama(
    model_path="models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
    n_ctx=CONTEXT_WINDOW,
)

if redis is not None:
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    try:
        redis_client.ping()
    except Exception:
        redis_client = None
else:
    redis_client = None
CACHE_TTL = 60 * 60 * 24  # 24 hours

def cache_lookup(key, fetch_func, *args, **kwargs):
    cache_key = f"cache:{key}:{hashlib.sha256(json.dumps(args, sort_keys=True).encode()).hexdigest()}"
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass
    result = fetch_func(*args, **kwargs)
    if redis_client:
        try:
            redis_client.setex(cache_key, CACHE_TTL, json.dumps(result))
        except Exception:
            pass
    return result

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: list = []

def extract_key_terms(text):
    if not isinstance(text, str):
        return []
    doc = nlp(text)
    terms = set()
    for chunk in doc.noun_chunks:
        if len(chunk.text) > 4:
            terms.add(chunk.text.lower())
    for ent in doc.ents:
        if len(ent.text) > 4:
            terms.add(ent.text.lower())
    words = re.findall(r'\b[a-zA-Z]{5,}\b', text.lower())
    for w in words:
        terms.add(w)
    return list(terms)

def _lookup_dictionary(term):
    try:
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{term}"
        js = requests.get(url, timeout=5).json()
        if isinstance(js, list) and js:
            meanings = js[0].get("meanings", [])
            if meanings:
                defs = meanings[0].get("definitions", [])
                if defs:
                    return defs[0].get("definition", "")
        return None
    except Exception:
        return None
def lookup_dictionary(term):
    return cache_lookup("dict", _lookup_dictionary, term)

def _search_semantic_scholar(query, limit=2):
    try:
        url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={query}&limit={limit}&fields=title,abstract,url"
        js = requests.get(url, timeout=10).json()
        return [
            {
                "title": p["title"],
                "abstract": p.get("abstract", ""),
                "url": p.get("url", "")
            }
            for p in js.get("data", [])
        ]
    except Exception:
        return []
def search_semantic_scholar(query, limit=2):
    return cache_lookup("semanticscholar", _search_semantic_scholar, query, limit)

def _search_pubmed(query, limit=2):
    try:
        search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax={limit}&term={query}"
        ids = requests.get(search_url, timeout=10).json()["esearchresult"]["idlist"]
        if not ids:
            return []
        fetch_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id={','.join(ids)}"
        summaries = requests.get(fetch_url, timeout=10).json()["result"]
        results = []
        for id in ids:
            item = summaries.get(id, {})
            results.append({
                "title": item.get("title", ""),
                "source": item.get("source", ""),
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{id}/"
            })
        return results
    except Exception:
        return []
def search_pubmed(query, limit=2):
    return cache_lookup("pubmed", _search_pubmed, query, limit)

def _fetch_wikipedia_summary(term):
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{term.replace(' ', '_')}"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("extract"), f"https://en.wikipedia.org/wiki/{term.replace(' ', '_')}"
        return None, None
    except Exception:
        return None, None
def fetch_wikipedia_summary(term):
    return cache_lookup("wikipedia", _fetch_wikipedia_summary, term)

def _scrape_trusted_health_site(query):
    try:
        search_url = f"https://medlineplus.gov/search/?query={requests.utils.quote(query)}"
        resp = requests.get(search_url, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        link = soup.find("a", class_="results-link")
        if link and link.get("href"):
            page_url = "https://medlineplus.gov" + link.get("href")
            page = requests.get(page_url, timeout=10)
            page_soup = BeautifulSoup(page.text, "html.parser")
            content = page_soup.find("div", class_="main-content")
            if content:
                text = " ".join(content.stripped_strings)
                return text[:1000], page_url
        return None, None
    except Exception:
        return None, None
def scrape_trusted_health_site(query):
    return cache_lookup("medlineplus", _scrape_trusted_health_site, query)

def _fetch_cdc(query):
    try:
        search_url = f"https://www.cdc.gov/search.do?queryText={requests.utils.quote(query)}"
        resp = requests.get(search_url, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        link = soup.find("a", href=re.compile(r"^/"))
        if link and link.get("href"):
            page_url = "https://www.cdc.gov" + link.get("href")
            page = requests.get(page_url, timeout=10)
            page_soup = BeautifulSoup(page.text, "html.parser")
            content = page_soup.get_text(separator=" ", strip=True)
            return content[:1000], page_url
        return None, None
    except Exception:
        return None, None
def fetch_cdc(query):
    return cache_lookup("cdc", _fetch_cdc, query)

def _fetch_mayo_clinic(query):
    try:
        search_url = f"https://www.mayoclinic.org/search/search-results?q={requests.utils.quote(query)}"
        resp = requests.get(search_url, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        link = soup.find("a", href=re.compile(r"^/drugs-supplements/"))
        if link and link.get("href"):
            page_url = "https://www.mayoclinic.org" + link.get("href")
            page = requests.get(page_url, timeout=10)
            page_soup = BeautifulSoup(page.text, "html.parser")
            content = page_soup.get_text(separator=" ", strip=True)
            return content[:1000], page_url
        return None, None
    except Exception:
        return None, None
def fetch_mayo_clinic(query):
    return cache_lookup("mayo", _fetch_mayo_clinic, query)

def highlight_relevant_sentences(text, query):
    if not isinstance(text, str) or not text:
        return ""
    keywords = set(extract_key_terms(query))
    sentences = re.split(r'(?<=[.!?]) +', text)
    relevant = [s for s in sentences if any(k in s.lower() for k in keywords)]
    chosen = relevant[:2] if relevant else sentences[:2]
    return " ".join(chosen)

def trim_to_sentences(text, max_sentences=2):
    if not isinstance(text, str) or not text:
        return ""
    sentences = re.split(r'(?<=[.!?]) +', text.strip())
    return " ".join(sentences[:max_sentences])

def build_grounding(user_input):
    sources = []
    key_terms = extract_key_terms(user_input)
    dict_defs = []
    for term in key_terms:
        definition = lookup_dictionary(term)
        if definition and isinstance(definition, str) and definition.strip():
            trimmed = trim_to_sentences(definition, 1)
            if trimmed:
                dict_defs.append(f"**{term}**: {trimmed}")
    if dict_defs:
        sources.append({"desc": "Dictionary definitions", "content": "\n".join(dict_defs), "url": None})

    wiki, wiki_url = fetch_wikipedia_summary(user_input)
    if wiki and isinstance(wiki, str) and wiki.strip():
        highlighted = highlight_relevant_sentences(wiki, user_input)
        if highlighted:
            sources.append({"desc": "Wikipedia", "content": highlighted, "url": wiki_url})

    # Prioritize guidelines and RCTs
    sources.append({"desc": "AHA/ACC/HFSA Guideline", "content": "2022 guideline for heart failure and arrhythmia management. Includes recommendations for acute and chronic AFib, rate/rhythm control, and anticoagulation. Class I, Level A evidence for immediate cardioversion in unstable patients.", "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000941"})
    sources.append({"desc": "ESC Guidelines", "content": "2021 European Society of Cardiology guideline for atrial fibrillation. Discusses risk stratification, anticoagulation, and management of AFib with chest pain. Class I, Level A evidence for anticoagulation based on CHA2DS2-VASc.", "url": "https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Atrial-Fibrillation-Management"})
    sources.append({"desc": "DAPA-HF Trial", "content": "Dapagliflozin in patients with heart failure and reduced ejection fraction.", "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1911303"})
    sources.append({"desc": "EMPEROR-Reduced Trial", "content": "Empagliflozin in heart failure with reduced ejection fraction.", "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa2022190"})

    papers = search_semantic_scholar(user_input)
    for p in papers:
        abstract = p.get('abstract')
        if abstract and isinstance(abstract, str) and abstract.strip():
            content = highlight_relevant_sentences(abstract, user_input)
            if content:
                sources.append({"desc": "Semantic Scholar", "content": f"{p['title']}: {content}", "url": p['url']})

    pubmed = search_pubmed(user_input)
    for p in pubmed:
        title = p.get('title')
        if title and isinstance(title, str) and title.strip():
            sources.append({"desc": "PubMed", "content": p['title'], "url": p['url']})

    medline, medline_url = scrape_trusted_health_site(user_input)
    if medline and isinstance(medline, str) and medline.strip():
        highlighted = highlight_relevant_sentences(medline, user_input)
        if highlighted:
            sources.append({"desc": "MedlinePlus", "content": highlighted, "url": medline_url})

    cdc, cdc_url = fetch_cdc(user_input)
    if cdc and isinstance(cdc, str) and cdc.strip():
        highlighted = highlight_relevant_sentences(cdc, user_input)
        if highlighted:
            sources.append({"desc": "CDC", "content": highlighted, "url": cdc_url})

    mayo, mayo_url = fetch_mayo_clinic(user_input)
    if mayo and isinstance(mayo, str) and mayo.strip():
        highlighted = highlight_relevant_sentences(mayo, user_input)
        if highlighted:
            sources.append({"desc": "Mayo Clinic", "content": highlighted, "url": mayo_url})

    return sources

def build_prompt(history, user_input, sources):
    source_texts = []
    for i, s in enumerate(sources, 1):
        if s["url"]:
            source_texts.append(f"[{i}] {s['desc']}: [{s['url']}]({s['url']})")
        else:
            source_texts.append(f"[{i}] {s['desc']}")

    system = (
        "You are a highly intelligent, evidence-based medical AI assistant for clinicians and pharmacists. "
        "You have access to dictionary definitions, research articles, clinical guidelines, and trusted health sites. "
        "When you receive a prompt, first break down and explain any key terms using dictionary definitions. "
        "Always tailor your answer to the clinical context. "
        "If the scenario is psychiatric, focus on psychiatric assessment and management. "
        "Only discuss cardiac or hemodynamic issues if the context is medical or cardiac. "
        "If the prompt includes clinical data (e.g., EF 25%), recognize the clinical context (e.g., HFrEF). "
        "Always prioritize guideline recommendations and RCT evidence. "
        "Start your answer with a **Clinical Summary**: a concise, actionable recommendation. "
        "Then, provide details with bullet points, bold for key terms, and headings for sections. "
        "Be thorough and detailed in your answer. Include all relevant steps, considerations, and cite all sources. "
        "Mention hemodynamic stability/instability, risk stratification (e.g., CHA2DS2-VASc), contraindications, and cautions if relevant. "
        "If guidelines differ, explain the differences. "
        "If class of recommendation or level of evidence is available, mention it. "
        "If further workup or specialist input is needed, say so. "
        "If the context is unclear, mention possible differentials or ask clarifying questions. "
        "Cite your sources in the answer using [1], [2], etc., and list the sources at the end as a numbered list with clickable links. "
        "Show your thinking process clearly, and provide a helpful, well-explained answer. "
        "If you are unsure, say so. This is not medical advice.\n"
    )
    if sources:
        system += "\n[Background Knowledge]\n"
        for i, s in enumerate(sources, 1):
            system += f"[{i}] {s['desc']}: {s['content']}\n"
    chat = ""
    for turn in history[-HISTORY_LIMIT:]:
        chat += f"User: {turn['user']}\nAI: {turn['ai']}\n"
    chat += f"User: {user_input}\nAI: Let's analyze and reason step by step.\n"
    system += "\nList the sources at the end as a numbered list with clickable markdown links.\n"
    return system + "\n" + chat + "\n## Sources\n" + "\n".join(source_texts)

def safe_token_count(llm, prompt):
    try:
        tokens = llm.tokenize(prompt)
    except Exception:
        tokens = llm.tokenize(prompt.encode())
    return len(tokens)

def prepare_prompt_and_trim(llm, build_prompt, history, user_input, sources):
    prompt = build_prompt(history, user_input, sources)
    while safe_token_count(llm, prompt) > MAX_PROMPT_TOKENS:
        if len(history) > 1:
            history = history[1:]
        elif sources:
            sources = sources[:-1]
        else:
            # As a last resort, remove lines from the end
            lines = prompt.splitlines()
            if len(lines) > 1:
                prompt = "\n".join(lines[:-1])
            else:
                # If only one line left, break
                break
        prompt = build_prompt(history, user_input, sources)
    # Final check: forcibly truncate if still too long
    while safe_token_count(llm, prompt) > MAX_PROMPT_TOKENS and len(prompt) > 10:
        prompt = prompt[:len(prompt)//2]
    return prompt

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        user_input = req.message.strip()
        history = req.history or []
        sources = build_grounding(user_input)
        prompt = prepare_prompt_and_trim(llm, build_prompt, history, user_input, sources)
        output = llm(prompt, max_tokens=GENERATE_TOKENS, stop=["User:", "AI:"])
        reply = output["choices"][0]["text"].strip()
        return {"reply": reply}
    except Exception as e:
        return {"error": str(e)}
