import os
import fitz


def get_pdf_information(path: str):
    try:
        if path.lower().endswith(".pdf"):
            pdf = fitz.open(path)
            pages = pdf.page_count
            pdf.close()
            return {"pages": max(1, pages)}
    except Exception:
        pass

    try:
        file_size = os.path.getsize(path) if os.path.exists(path) else 0
        pages = max(1, file_size // 50000) if file_size > 0 else 1
        return {"pages": pages}
    except Exception:
        return {"pages": 1}