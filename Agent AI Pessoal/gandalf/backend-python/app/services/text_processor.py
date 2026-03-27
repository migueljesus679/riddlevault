from pathlib import Path
import re
from collections import Counter


def process_text(file_path: str) -> dict:
    text = Path(file_path).read_text(encoding="utf-8", errors="replace")

    words = re.findall(r"\b\w+\b", text.lower())
    word_freq = Counter(words).most_common(20)

    lines = text.split("\n")
    non_empty = [l for l in lines if l.strip()]

    return {
        "type": "txt",
        "text": text,
        "char_count": len(text),
        "word_count": len(words),
        "line_count": len(lines),
        "non_empty_lines": len(non_empty),
        "top_words": [{"word": w, "count": c} for w, c in word_freq],
    }
