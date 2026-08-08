from decimal import Decimal

from sqlalchemy import Boolean, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel
from sqlalchemy import Enum
from app.enums.service_pricing_type import ServicePricingType


class Service(BaseModel):
    __tablename__ = "services"

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    pricing_type: Mapped[ServicePricingType] = mapped_column(
    Enum(ServicePricingType),
    default=ServicePricingType.FIXED,
    nullable=False,
)