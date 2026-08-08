from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.db.base import BaseModel

from app.enums.waiting_room_status import (
    WaitingRoomStatus,
)

from app.enums.waiting_room_entry import (
    WaitingRoomEntry,
)
from uuid import UUID


class WaitingRoom(BaseModel):

    __tablename__ = "waiting_room"

    student_id: Mapped[UUID] = mapped_column(
    ForeignKey("users.id"),
    nullable=False,
    index=True,
)

    entry_point: Mapped[
        WaitingRoomEntry
    ] = mapped_column(
        Enum(
            WaitingRoomEntry,
            name="waitingroomentry",
            create_type=False,
        ),
        nullable=False,
    )

    status: Mapped[
        WaitingRoomStatus
    ] = mapped_column(
        Enum(
            WaitingRoomStatus,
            name="waitingroomstatus",
            create_type=False,
        ),
        nullable=False,
        index=True
    )


    session_token: Mapped[UUID | None] = mapped_column(
        nullable=True,
        unique=True,
)

    server_load_at_join: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    admitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    left_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )