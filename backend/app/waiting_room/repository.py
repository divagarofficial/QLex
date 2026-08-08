from datetime import datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.enums.waiting_room_status import WaitingRoomStatus
from app.models.waiting_room import WaitingRoom


class WaitingRoomRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_active_session(
        self,
        student_id: UUID,
    ):

        return (
            self.db.query(WaitingRoom)
            .filter(
                WaitingRoom.student_id == student_id,
                WaitingRoom.status == WaitingRoomStatus.ADMITTED,
                WaitingRoom.expires_at > datetime.utcnow(),
            )
            .first()
        )

    def get_waiting_entry(
        self,
        student_id: UUID,
    ):

        return (
            self.db.query(WaitingRoom)
            .filter(
                WaitingRoom.student_id == student_id,
                WaitingRoom.status == WaitingRoomStatus.WAITING,
            )
            .first()
        )

    def create(
        self,
        waiting_room: WaitingRoom,
    ):

        self.db.add(waiting_room)

        self.db.commit()

        self.db.refresh(waiting_room)

        return waiting_room

    def save(self):

        self.db.commit()

    def get_next_waiting_student(self):

        return (
            self.db.query(WaitingRoom)
            .filter(
                WaitingRoom.status == WaitingRoomStatus.WAITING,
            )
            .order_by(
                WaitingRoom.joined_at.asc(),
            )
            .first()
        )

    def cleanup_expired_sessions(self):

        sessions = (
            self.db.query(WaitingRoom)
            .filter(
                WaitingRoom.status == WaitingRoomStatus.ADMITTED,
                WaitingRoom.expires_at < datetime.utcnow(),
            )
            .all()
        )

        for session in sessions:

            session.status = WaitingRoomStatus.EXPIRED

        # Also expire stale WAITING entries older than 5 minutes
        stale_waiting = (
            self.db.query(WaitingRoom)
            .filter(
                WaitingRoom.status == WaitingRoomStatus.WAITING,
                WaitingRoom.joined_at < datetime.utcnow() - timedelta(minutes=5),
            )
            .all()
        )

        for w in stale_waiting:

            w.status = WaitingRoomStatus.EXPIRED

        self.db.commit()

    def waiting_count(self):

        return (
            self.db.query(func.count(WaitingRoom.id))
            .filter(
                WaitingRoom.status == WaitingRoomStatus.WAITING,
            )
            .scalar()
        )

    def position(
        self,
        student_id: UUID,
    ):

        entry = self.get_waiting_entry(
            student_id
        )

        if entry is None:

            return None

        count = (
            self.db.query(func.count(WaitingRoom.id))
            .filter(
                WaitingRoom.status == WaitingRoomStatus.WAITING,
                WaitingRoom.joined_at < entry.joined_at,
            )
            .scalar()
        )

        return (count or 0) + 1
    
    def active_session_count(self):

        return (

            self.db.query(
                func.count(
                    WaitingRoom.id
                )
            )

            .filter(

                WaitingRoom.status
                == WaitingRoomStatus.ADMITTED,

                WaitingRoom.expires_at
                > datetime.utcnow(),
            )

            .scalar()

        )
    
    def leave_session(
    self,
    student_id,
):

        entries = (
            self.db.query(WaitingRoom)
            .filter(
                WaitingRoom.student_id == student_id,
                WaitingRoom.status.in_([
                    WaitingRoomStatus.ADMITTED,
                    WaitingRoomStatus.WAITING,
                ]),
            )
            .all()
        )

        if not entries:
            return None

        for entry in entries:
            entry.status = WaitingRoomStatus.LEFT
            entry.left_at = datetime.utcnow()

        self.save()

        return entries[0]
    
    def get_by_session_token(
    self,
    session_token,
):

        return (
            self.db.query(WaitingRoom)
            .filter(
                WaitingRoom.session_token == session_token,
                WaitingRoom.status == WaitingRoomStatus.ADMITTED,
                WaitingRoom.expires_at > datetime.utcnow(),
            )
            .first()
        )
    
    def promote_waiting_student(
    self,
    waiting,
):

        waiting.status = (
            WaitingRoomStatus.ADMITTED
        )

        waiting.session_token = uuid4()

        waiting.admitted_at = datetime.utcnow()

        waiting.expires_at = (
            datetime.utcnow()
            + timedelta(minutes=10)
        )

        self.save()

        return waiting
        
        