from datetime import datetime, date
from uuid import UUID
from app.enums.queue_type import QueueType

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import BaseModel
from app.enums.queue_state import QueueState


class ShopQueue(BaseModel):

    __tablename__ = "shop_queue"

    order_id: Mapped[UUID] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False,
        unique=True,
    )

    queue_date: Mapped[date] = mapped_column(
    Date,
    nullable=False,
)

    queue_type: Mapped[QueueType] = mapped_column(
    Enum(QueueType),
    nullable=False,
)

    queue_number: Mapped[int] = mapped_column(
        nullable=False,
)

    token: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
)

    queue_state: Mapped[QueueState] = mapped_column(
        Enum(QueueState),
        default=QueueState.WAITING,
        nullable=False,
    )

    is_current: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    opened_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    downloaded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    printing_started_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    ready_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    served_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    rejected_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    order = relationship(
        "Order",
        back_populates="shop_queue",
    )

    __table_args__ = (

        Index(
            "ix_shop_queue_date",
            "queue_date",
        ),

        Index(
            "ix_shop_queue_state",
            "queue_state",
        ),

        Index(
            "ix_shop_queue_current",
            "is_current",
        ),

        UniqueConstraint(
    "queue_date",
    "queue_type",
    "queue_number",
    name="uq_daily_queue_number",
),
    )