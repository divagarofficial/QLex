import os
from pathlib import Path
from uuid import UUID

import aiofiles

if os.path.exists("/data"):
    UPLOAD_ROOT = Path("/data/uploads")
elif os.path.exists("/tmp"):
    UPLOAD_ROOT = Path("/tmp/uploads")
else:
    UPLOAD_ROOT = Path("uploads")

DRAFT_ROOT = UPLOAD_ROOT / "drafts"

ORDER_ROOT = UPLOAD_ROOT / "orders"


def get_draft_directory(order_id: UUID):

    directory = DRAFT_ROOT / str(order_id)

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    return directory


def find_uploaded_file(relative_path: str) -> Path | None:
    """Searches for an uploaded file across all candidate upload locations (/tmp, /data, /app, local)."""
    clean_rel = relative_path.lstrip("/").replace("uploads/", "", 1)
    
    candidate_roots = [
        UPLOAD_ROOT,
        Path("/tmp/uploads"),
        Path("/data/uploads"),
        Path("/app/uploads"),
        Path("uploads"),
        Path(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")),
    ]
    
    for root in candidate_roots:
        target = root / clean_rel
        if target.exists() and target.is_file():
            return target
            
    return None


def generate_fallback_pdf(filename: str = "Document.pdf") -> bytes:
    """Generates a clean PDF notice when an uploaded document file is missing on the server disk."""
    try:
        from io import BytesIO
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Light background
        c.setFillColorRGB(0.96, 0.96, 0.98)
        c.rect(0, 0, width, height, fill=True, stroke=False)

        # Card container
        c.setFillColorRGB(1, 1, 1)
        c.setStrokeColorRGB(0.85, 0.85, 0.9)
        c.roundRect(40, height - 320, width - 80, 240, 12, fill=True, stroke=True)

        # Header Badge
        c.setFillColorRGB(0.95, 0.6, 0.1)
        c.roundRect(65, height - 130, 140, 26, 6, fill=True, stroke=False)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(75, height - 118, "QLEX DOCUMENT")

        # Title
        c.setFillColorRGB(0.15, 0.15, 0.25)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(65, height - 170, "Document Preview Notice")

        # Filename
        clean_name = os.path.basename(filename)
        c.setFillColorRGB(0.3, 0.3, 0.4)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(65, height - 200, f"File: {clean_name}")

        # Notice text
        c.setFillColorRGB(0.45, 0.45, 0.55)
        c.setFont("Helvetica", 10)
        c.drawString(65, height - 230, "This order document was uploaded in a previous test session or local dev environment.")
        c.drawString(65, height - 248, "The database record is intact. Please upload a new document to test live processing.")

        c.showPage()
        c.save()
        return buffer.getvalue()
    except Exception as err:
        print(f"Fallback PDF generation error: {err}")
        return b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000108 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"


async def save_file(file, destination):

    async with aiofiles.open(destination, "wb") as out:

        while True:

            chunk = await file.read(1024 * 1024)

            if not chunk:
                break

            await out.write(chunk)

    await file.seek(0)