try:
    import psutil
except ImportError:
    psutil = None

from app.waiting_room.repository import (
    WaitingRoomRepository,
)


class LoadService:

    MAX_CPU = 90

    MAX_RAM = 95

    MAX_ACTIVE_SESSIONS = 100

    def __init__(
        self,
        db,
    ):

        self.repository = (
            WaitingRoomRepository(db)
        )

    def cpu_usage(self):
        if not psutil:
            return 10.0
        try:
            return psutil.cpu_percent(
                interval=0.01
            )
        except Exception:
            return 0.0

    def memory_usage(self):
        if not psutil:
            return 10.0
        try:
            return psutil.virtual_memory().percent
        except Exception:
            return 0.0

    def active_sessions(self):

        return (
            self.repository
            .active_session_count()
        )

    def current_load(self):

        cpu = self.cpu_usage()

        ram = self.memory_usage()

        sessions = (
            self.active_sessions()
        )

        cpu_score = (
            cpu / self.MAX_CPU
        ) * 100

        ram_score = (
            ram / self.MAX_RAM
        ) * 100

        session_score = (
            sessions
            / self.MAX_ACTIVE_SESSIONS
        ) * 100

        return min(
            100.0,
            max(
                cpu_score,
                ram_score,
                session_score,
            )
        )

    def can_admit(self):

        return (
            self.active_sessions() < self.MAX_ACTIVE_SESSIONS
            and self.cpu_usage() < self.MAX_CPU
            and self.memory_usage() < self.MAX_RAM
        )