from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.dependencies import get_current_user

from .schemas import (
    EnterWaitingRoomRequest,
    WaitingRoomResponse,
    AdminWaitingRoomMetrics,
)
from .service import WaitingRoomService

router = APIRouter(
    prefix="/waiting-room",
    tags=["Waiting Room"],
)


@router.post(
    "/enter",
    response_model=WaitingRoomResponse,
)
def enter_waiting_room(
    request: EnterWaitingRoomRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    service = WaitingRoomService(db)

    return service.join_or_admit(
        current_user.id,
        request.entry_point,
    )


@router.get(
    "/status",
    response_model=WaitingRoomResponse,
)
def waiting_room_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    service = WaitingRoomService(db)

    return service.join_or_admit(
        current_user.id,
        None,
    )


@router.post("/leave")
def leave_waiting_room(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    service = WaitingRoomService(db)

    return service.leave(
        current_user.id
    )


@router.get(
    "/admin/metrics",
    response_model=AdminWaitingRoomMetrics,
)
def get_admin_metrics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = WaitingRoomService(db)
    return service.get_metrics()


@router.post("/admin/admit-next")
def admin_admit_next(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = WaitingRoomService(db)
    return service.admin_admit_next()


@router.post("/admin/flush-expired")
def admin_flush_expired(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = WaitingRoomService(db)
    return service.admin_flush_expired()