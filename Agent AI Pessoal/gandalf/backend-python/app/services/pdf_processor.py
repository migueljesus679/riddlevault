import pdfplumber
from pathlib import Path


def process_pdf(file_path: str) -> dict:
    result = {
        "type": "pdf",
        "text": "",
        "pages": 0,
        "tables": [],
        "metadata": {},
    }

    with pdfplumber.open(file_path) as pdf:
        result["pages"] = len(pdf.pages)
        result["metadata"] = pdf.metadata or {}

        all_text = []
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            all_text.append(text)

            tables = page.extract_tables()
            for table in tables:
                if table:
                    headers = table[0] if table else []
                    rows = table[1:] if len(table) > 1 else []
                    result["tables"].append({
                        "page": i + 1,
                        "headers": headers,
                        "rows": rows[:50],
                        "total_rows": len(rows),
                    })

        result["text"] = "\n\n".join(all_text)

    return result
