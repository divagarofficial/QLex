from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    Enum,
    ForeignKey,
    Index,
    Numeric,
    String,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import BaseModel
from app.enums.payment_status import PaymentStatus


class Payment(BaseModel):

    __tablename__ = "payments"

    order_id: Mapped[UUID] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    status: Mapped[PaymentStatus] = mapped_column(
        Enum(
            PaymentStatus,
            name="payment_status",
            create_type=False,
        ),
        default=PaymentStatus.PENDING,
        nullable=False,
    )

    gateway: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    gateway_order_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
    )

    gateway_payment_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
    )

    gateway_signature: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    order = relationship(
        "Order",
        back_populates="payments",
    )

    __table_args__ = (
        Index(
            "ix_payments_order_id",
            "order_id",
        ),
        Index(
            "ix_payments_status",
            "status",
        ),
    )