from fastapi import UploadFile

MAX_SIZE = 50 * 1024 * 1024


async def validate_pdf(file: UploadFile):

    if not file.filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are allowed.")

    content = await file.read()

    if len(content) > MAX_SIZE:
        raise ValueError("Maximum upload size exceeded.")

    await file.seek(0)