from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    ForeignKey,
    Index,
    Integer,
    Numeric,
    UniqueConstraint,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import BaseModel


class OrderDocumentService(BaseModel):

    __tablename__ = "order_document_services"

    order_document_id: Mapped[UUID] = mapped_column(
        ForeignKey("order_documents.id"),
        nullable=False,
    )

    service_id: Mapped[UUID] = mapped_column(
        ForeignKey("services.id"),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    # Relationship with OrderDocument

    document = relationship(
        "OrderDocument",
        back_populates="document_services",
    )

    # Relationship with Service

    service = relationship(
        "Service",
    )

    __table_args__ = (

        UniqueConstraint(
            "order_document_id",
            "service_id",
            name="uq_order_document_service",
        ),

        Index(
            "ix_order_document_services_document",
            "order_document_id",
        ),
    )