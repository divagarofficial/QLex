from datetime import datetime, timedelta
from uuid import uuid4

from app.enums.waiting_room_status import WaitingRoomStatus
from app.models.waiting_room import WaitingRoom

from app.system.load_service import LoadService
from .repository import WaitingRoomRepository

class WaitingRoomService:

    SESSION_MINUTES = 10

    def __init__(
        self,
        db,
    ):

        self.db = db

        self.repository = (
            WaitingRoomRepository(db)
        )

        self.load_service = (
            LoadService(db)
        )

    def admit_student(
    self,
    student_id,
    entry_point,
):

        session = WaitingRoom(

            student_id=student_id,

            entry_point=entry_point,

            status=WaitingRoomStatus.ADMITTED,

            session_token=uuid4(),

            server_load_at_join=(
                self.load_service.current_load()
            ),

            joined_at=datetime.utcnow(),

            admitted_at=datetime.utcnow(),

            expires_at=(
                datetime.utcnow()
                + timedelta(
                    minutes=self.SESSION_MINUTES
                )
            ),
        )

        return self.repository.create(
            session
        )
    
    def join_queue(
    self,
    student_id,
    entry_point,
):

        waiting = WaitingRoom(

            student_id=student_id,

            entry_point=entry_point,

            status=WaitingRoomStatus.WAITING,

            server_load_at_join=(
                self.load_service.current_load()
            ),

            joined_at=datetime.utcnow(),
        )

        return self.repository.create(
            waiting
        )
    
    def _get_telemetry(self):
        total_waiting = self.repository.waiting_count() or 0
        active_sessions = self.load_service.active_sessions() or 0
        load_pct = round(self.load_service.current_load(), 1)

        if load_pct >= 90.0:
            traffic_level = "SURGE"
        elif load_pct >= 75.0:
            traffic_level = "HIGH"
        elif load_pct >= 50.0:
            traffic_level = "NORMAL"
        else:
            traffic_level = "LOW"

        return {
            "traffic_level": traffic_level,
            "total_waiting_count": total_waiting,
            "active_sessions_count": active_sessions,
            "server_load_percentage": load_pct,
        }

    def join_or_admit(
        self,
        student_id,
        entry_point,
    ):
        if not entry_point:
            entry_point = "new_order"

        # Process expired sessions and admit waiting students
        self.process_queue()
        telemetry = self._get_telemetry()

        # Check if the student already has an active session
        active = (
            self.repository
            .get_active_session(
                student_id
            )
        )

        if active:
            return {
                "allowed": True,
                "status": "ADMITTED",
                "session_token": str(
                    active.session_token
                ),
                "expires_at": (
                    active.expires_at
                ),
                **telemetry,
            }

        # Check if the student is already waiting
        waiting = (
            self.repository
            .get_waiting_entry(
                student_id
            )
        )

        if waiting:
            # Capacity became available while waiting
            if self.load_service.can_admit():
                waiting = self.promote_student(
                    waiting
                )
                return {
                    "allowed": True,
                    "status": "ADMITTED",
                    "session_token": str(
                        waiting.session_token
                    ),
                    "expires_at": (
                        waiting.expires_at
                    ),
                    **telemetry,
                }

            position = (
                self.repository.position(
                    student_id
                )
            ) or 1

            return {
                "allowed": False,
                "status": "WAITING",
                "position": position,
                "estimated_wait_seconds": position * 30,
                "poll_after_seconds": 3,
                **telemetry,
            }

        # Student is entering for the first time
        if self.load_service.can_admit():
            session = self.admit_student(
                student_id,
                entry_point,
            )
            return {
                "allowed": True,
                "status": "ADMITTED",
                "session_token": str(
                    session.session_token
                ),
                "expires_at": (
                    session.expires_at
                ),
                **telemetry,
            }

        # Join the waiting queue
        self.join_queue(
            student_id,
            entry_point,
        )

        position = (
            self.repository.position(
                student_id
            )
        ) or 1

        return {
            "allowed": False,
            "status": "WAITING",
            "position": position,
            "estimated_wait_seconds": position * 30,
            "poll_after_seconds": 3,
            **telemetry,
        }

    def get_metrics(self):
        telemetry = self._get_telemetry()
        return {
            "total_waiting": telemetry["total_waiting_count"],
            "active_sessions": telemetry["active_sessions_count"],
            "max_capacity": self.load_service.MAX_ACTIVE_SESSIONS,
            "server_load_percentage": telemetry["server_load_percentage"],
            "traffic_level": telemetry["traffic_level"],
            "cpu_usage": round(self.load_service.cpu_usage(), 1),
            "memory_usage": round(self.load_service.memory_usage(), 1),
        }

    def admin_admit_next(self):
        next_student = self.repository.get_next_waiting_student()
        if next_student:
            promoted = self.promote_student(next_student)
            return {"success": True, "admitted_student_id": str(promoted.student_id)}
        return {"success": False, "message": "No waiting students in queue"}

    def admin_flush_expired(self):
        self.repository.cleanup_expired_sessions()
        return {"success": True, "message": "Expired sessions flushed successfully"}
    
    def admit_next_student(
    self,
):

        if not self.load_service.can_admit():

            return None

        next_student = (
            self.repository
            .get_next_waiting_student()
        )

        if next_student is None:

            return None

        return self.promote_student(
            next_student
        )
    
    def process_queue(
    self,
):

        self.repository.cleanup_expired_sessions()

        while self.load_service.can_admit():

            admitted = self.admit_next_student()

            if admitted is None:

                break
    
    def leave(
    self,
    student_id,
):

        self.repository.leave_session(
            student_id
        )

        self.process_queue()

        return {
            "success": True
        }
        
    def promote_student(
    self,
    waiting_student,
):

        waiting_student.status = (
            WaitingRoomStatus.ADMITTED
        )

        waiting_student.session_token = (
            uuid4()
        )

        waiting_student.admitted_at = (
            datetime.utcnow()
        )

        waiting_student.expires_at = (

            datetime.utcnow()

            + timedelta(
                minutes=self.SESSION_MINUTES
            )

        )

        self.repository.save()

        return waiting_student


                    