from sqlalchemy import Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class Year(BaseModel):
    __tablename__ = "years"

    year_number: Mapped[int] = mapped_column(
        Integer,
        unique=True,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )