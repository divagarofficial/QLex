from pathlib import Path
from fastapi import UploadFile

MAX_SIZE = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".pptx", ".ppt", ".txt", ".png", ".jpg", ".jpeg"}


async def validate_pdf(file: UploadFile):
    filename = file.filename or ""
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File format '{ext}' is not supported. Please upload PDF, DOCX, or PPTX files.")

    content = await file.read()

    if len(content) > MAX_SIZE:
        raise ValueError("Maximum upload size exceeded (50MB limit).")

    await file.seek(0)