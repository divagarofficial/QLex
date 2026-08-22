from decimal import Decimal

from sqlalchemy import Boolean, Integer, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class PlatformSetting(BaseModel):
    __tablename__ = "platform_settings"

    platform_fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=2,
        nullable=False,
    )

    priority_fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=3,
        nullable=False,
    )

    max_documents_per_order: Mapped[int] = mapped_column(
        Integer,
        default=20,
        nullable=False,
    )

    max_upload_size_mb: Mapped[int] = mapped_column(
        Integer,
        default=50,
        nullable=False,
    )

    max_pages_per_document: Mapped[int] = mapped_column(
        Integer,
        default=1000,
        nullable=False,
    )

    draft_expiry_hours: Mapped[int] = mapped_column(
        Integer,
        default=24,
        nullable=False,
    )

    queue_timeout_minutes: Mapped[int] = mapped_column(
        Integer,
        default=10,
        nullable=False,
    )

    allow_new_orders: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    maintenance_mode: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    allow_first_year_personal_email: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    extra_settings: Mapped[dict | None] = mapped_column(
        JSON,
        default=dict,
        nullable=True,
    )