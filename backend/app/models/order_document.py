from decimal import Decimal

from sqlalchemy import (
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel
from app.enums.paper_size import PaperSize
from app.enums.print_side import PrintSide
from app.enums.print_type import PrintType
from uuid import UUID
from sqlalchemy import Index

class OrderDocument(BaseModel):
    __tablename__ = "order_documents"

    order_id: Mapped[UUID] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False,
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    stored_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    file_size: Mapped[int] = mapped_column(
        nullable=False,
    )

    page_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    paper_size: Mapped[PaperSize] = mapped_column(
        Enum(PaperSize),
        nullable=False,
    )

    print_type: Mapped[PrintType] = mapped_column(
        Enum(PrintType),
        nullable=False,
    )

    print_side: Mapped[PrintSide] = mapped_column(
        Enum(PrintSide),
        nullable=False,
    )

    copies: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    custom_pages: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    display_order: Mapped[int] = mapped_column(
    Integer,
    default=1,
    nullable=False,
    )

    shop_price_per_page: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    document_total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    order = relationship(
        "Order",
        back_populates="documents",
    )

    document_services = relationship(
    "OrderDocumentService",
    back_populates="document",
    cascade="all, delete-orphan",
)

    __table_args__ = (
    Index("ix_order_documents_order_id", "order_id"),
)

    @property
    def url(self) -> str:
        import os
        from app.core.config import settings

        base_url = (
            getattr(settings, "BACKEND_URL", "")
            or os.getenv("BACKEND_URL", "")
            or os.getenv("API_BASE_URL", "")
            or os.getenv("NEXT_PUBLIC_API_URL", "")
            or ""
        ).rstrip("/")

        if base_url:
            return f"{base_url}/uploads/drafts/{self.order_id}/{self.stored_filename}"
        return f"/uploads/drafts/{self.order_id}/{self.stored_filename}"