from datetime import date

from sqlalchemy import Date, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class DailyQueueCounter(BaseModel):

    __tablename__ = "daily_queue_counter"

    queue_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        unique=True,
    )

    priority_last: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    regular_last: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    satellite_last: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )