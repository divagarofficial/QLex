from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class Department(BaseModel):
    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )