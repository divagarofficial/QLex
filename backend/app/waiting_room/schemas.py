from datetime import datetime
from pydantic import BaseModel

from app.enums.waiting_room_entry import WaitingRoomEntry


class EnterWaitingRoomRequest(BaseModel):

    entry_point: WaitingRoomEntry


class WaitingRoomResponse(BaseModel):

    allowed: bool

    status: str

    session_token: str | None = None

    expires_at: datetime | None = None

    position: int | None = None

    estimated_wait_seconds: int | None = None

    poll_after_seconds: int | None = None

    traffic_level: str | None = "NORMAL"

    total_waiting_count: int | None = 0

    active_sessions_count: int | None = 0

    server_load_percentage: float | None = 0.0


class AdminWaitingRoomMetrics(BaseModel):

    total_waiting: int

    active_sessions: int

    max_capacity: int

    server_load_percentage: float

    traffic_level: str

    cpu_usage: float

    memory_usage: float