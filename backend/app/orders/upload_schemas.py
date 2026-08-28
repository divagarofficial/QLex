from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel
from app.enums.paper_size import PaperSize
from app.enums.print_side import PrintSide
from app.enums.print_type import PrintType


class UploadedDocumentResponse(BaseModel):

    id: UUID

    original_filename: str

    page_count: int

    file_size: int = 0

    url: str | None = None

    copies: int

    custom_pages: str | None = None

    printable_page_count: int = 1

    document_total: Decimal

    model_config = {
        "from_attributes": True
    }


class UploadResponse(BaseModel):

    documents: list[UploadedDocumentResponse]




class UpdateDocumentRequest(BaseModel):

    paper_size: PaperSize

    print_type: PrintType

    print_side: PrintSide

    copies: int

    spiral_binding: bool = False

    soft_binding: bool = False

    custom_pages: str | None = None


class DocumentResponse(BaseModel):

    id: UUID

    page_count: int

    file_size: int = 0

    url: str | None = None

    paper_size: PaperSize

    print_type: PrintType

    print_side: PrintSide

    copies: int

    custom_pages: str | None = None

    printable_page_count: int = 1

    document_total: Decimal

    model_config = {
        "from_attributes": True
    }