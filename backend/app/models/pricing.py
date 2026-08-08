from decimal import Decimal

from sqlalchemy import Boolean, Enum, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel
from app.enums.paper_size import PaperSize
from app.enums.print_side import PrintSide
from app.enums.print_type import PrintType


class Pricing(BaseModel):
    __tablename__ = "pricing"

    paper_size: Mapped[PaperSize] = mapped_column(
    Enum(PaperSize, name="papersize", create_type=False),
    nullable=False,
    )

    print_type: Mapped[PrintType] = mapped_column(
    Enum(PrintType, name="printtype", create_type=False),
    nullable=False,
    )

    print_side: Mapped[PrintSide] = mapped_column(
    Enum(PrintSide, name="printside", create_type=False),
    nullable=False,
    )

    shop_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    convenience_fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )