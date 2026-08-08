from decimal import Decimal
from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.enums.settlement_status import SettlementStatus
from app.db.base import BaseModel


class Settlement(BaseModel):

    __tablename__ = "settlements"

    shop_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    settlement_date: Mapped[Date] = mapped_column(
        Date,
        nullable=False,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    status: Mapped[SettlementStatus] = mapped_column(
        Enum(
            SettlementStatus,
            name="settlementstatus",
            create_type=False,
        ),
        nullable=False,
        default=SettlementStatus.PENDING,
    )

    generated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    paid_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    upi_reference: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    notes: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )