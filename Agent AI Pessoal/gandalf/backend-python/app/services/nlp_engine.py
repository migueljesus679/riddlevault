import re
from collections import Counter


def extract_keywords(text: str, top_n: int = 15) -> list[str]:
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "to", "of", "in", "for",
        "on", "with", "at", "by", "from", "as", "into", "through", "during",
        "before", "after", "above", "below", "between", "out", "off", "over",
        "under", "again", "further", "then", "once", "and", "but", "or",
        "nor", "not", "so", "yet", "both", "either", "neither", "each",
        "every", "all", "any", "few", "more", "most", "other", "some",
        "such", "no", "only", "own", "same", "than", "too", "very",
        "just", "because", "if", "when", "where", "how", "what", "which",
        "who", "whom", "this", "that", "these", "those", "it", "its",
        "he", "she", "they", "them", "his", "her", "their", "my", "your",
        "our", "me", "him", "us", "i", "you", "we",
        "o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das",
        "em", "no", "na", "nos", "nas", "por", "para", "com", "sem",
        "que", "e", "ou", "mas", "se", "como", "mais", "menos",
        "este", "esta", "esse", "essa", "aquele", "aquela",
        "ele", "ela", "eles", "elas", "eu", "tu", "nos", "vos",
        "ser", "estar", "ter", "haver", "ir", "nao", "sim",
    }
    words = re.findall(r"\b[a-zA-ZÀ-ÿ]{3,}\b", text.lower())
    filtered = [w for w in words if w not in stopwords]
    freq = Counter(filtered)
    return [w for w, _ in freq.most_common(top_n)]


def generate_summary(text: str, max_sentences: int = 5) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    if not sentences:
        return text[:500]

    word_freq = Counter(re.findall(r"\b[a-zA-ZÀ-ÿ]{3,}\b", text.lower()))

    scored = []
    for s in sentences:
        words = re.findall(r"\b[a-zA-ZÀ-ÿ]{3,}\b", s.lower())
        score = sum(word_freq.get(w, 0) for w in words) / max(len(words), 1)
        scored.append((score, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:max_sentences]
    ordered = sorted(top, key=lambda x: text.index(x[1]))
    return " ".join(s for _, s in ordered)


def extract_entities(text: str) -> dict:
    patterns = {
        "emails": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        "urls": r"https?://[^\s<>\"']+",
        "phones": r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b",
        "dates": r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
        "numbers": r"\b\d+[.,]?\d*\b",
    }
    entities = {}
    for name, pattern in patterns.items():
        matches = list(set(re.findall(pattern, text)))[:20]
        if matches:
            entities[name] = matches
    return entities


def analyze_text(text: str) -> dict:
    return {
        "summary": generate_summary(text),
        "keywords": extract_keywords(text),
        "entities": extract_entities(text),
        "word_count": len(re.findall(r"\b\w+\b", text)),
        "sentence_count": len(re.split(r"(?<=[.!?])\s+", text.strip())),
    }
