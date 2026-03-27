import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_processor import process_pdf
from app.services.docx_processor import process_docx
from app.services.csv_processor import process_csv
from app.services.text_processor import process_text
from app.services.nlp_engine import analyze_text

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/app/storage/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

PROCESSORS = {
    "application/pdf": ("pdf", process_pdf),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ("docx", process_docx),
    "text/csv": ("csv", process_csv),
    "text/plain": ("txt", process_text),
    "application/vnd.ms-excel": ("csv", process_csv),
}


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.content_type or file.content_type not in PROCESSORS:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext == ".csv":
            file.content_type = "text/csv"
        elif ext == ".txt":
            file.content_type = "text/plain"
        elif ext == ".pdf":
            file.content_type = "application/pdf"
        elif ext == ".docx":
            file.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type or ext}")

    doc_type, processor = PROCESSORS[file.content_type]
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "file")[1] or f".{doc_type}"
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = processor(file_path)
        text = result.get("text", "")
        nlp = analyze_text(text) if text and len(text) > 50 else {}

        return {
            "id": file_id,
            "filename": file.filename,
            "type": doc_type,
            "size": os.path.getsize(file_path),
            "processing": result,
            "analysis": nlp,
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/analyze")
async def analyze_document_text(body: dict):
    text = body.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    return analyze_text(text)


@router.post("/process-file")
async def process_file_by_path(body: dict):
    file_path = body.get("path", "")
    filename = body.get("filename", "")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail=f"File not found: {file_path}")

    ext = os.path.splitext(filename or file_path)[1].lower()
    ext_map = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".csv": "text/csv",
        ".txt": "text/plain",
        ".xlsx": "application/vnd.ms-excel",
    }
    content_type = ext_map.get(ext)
    if not content_type or content_type not in PROCESSORS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    doc_type, processor = PROCESSORS[content_type]
    file_id = str(uuid.uuid4())

    try:
        result = processor(file_path)
        text = result.get("text", "")
        nlp = analyze_text(text) if text and len(text) > 50 else {}

        return {
            "id": file_id,
            "filename": filename,
            "type": doc_type,
            "size": os.path.getsize(file_path),
            "processing": result,
            "analysis": nlp,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
