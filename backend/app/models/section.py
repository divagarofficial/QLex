from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class Section(BaseModel):
    __tablename__ = "sections"

    name: Mapped[str] = mapped_column(
        String(10),
        unique=True,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )