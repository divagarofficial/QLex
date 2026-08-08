from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.database import get_db

from .schemas import MyTokenResponse
from .service import StudentService
from .schemas import LiveQueueResponse
from .schemas import MyOrdersResponse
from .schemas import PaymentsResponse
from .schemas import OrderDetailsResponse
from uuid import UUID
from app.waiting_room.middleware import (
    waiting_room_required,
)

router = APIRouter(
    prefix="/student",
    tags=["Student"],
)


@router.get(
    "/token",
    response_model=MyTokenResponse,
)
def my_token(

    current_user=Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):

    service = StudentService(db)

    return service.my_token(
        current_user.id
    )

@router.get(
    "/live-queue",
    response_model=LiveQueueResponse,
)
def live_queue(

    db: Session = Depends(get_db),

):

    service = StudentService(db)

    return service.live_queue()

@router.get(
    "/orders",
    response_model=MyOrdersResponse,
)
def my_orders(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = StudentService(db)
    return service.my_orders(current_user.id)

@router.get(
    "/orders/{order_id}",
    response_model=OrderDetailsResponse,
)
def order_details(
    order_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = StudentService(db)
    return service.order_details(
        current_user.id,
        order_id,
    )

@router.get(
    "/payments",
    response_model=PaymentsResponse,
)
def payments(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = StudentService(db)
    return service.payments(current_user.id)


