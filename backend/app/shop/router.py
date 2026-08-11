from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from .schemas import ShopOrderResponse
from .service import ShopService
from .schemas import TodayOrderResponse
from .schemas import ShopOrderDetailsResponse
from uuid import UUID
from .schemas import QueueStateResponse
from .schemas import TodayRevenueResponse


router = APIRouter(
    prefix="/shop",
    tags=["Shop"],
)


@router.get(
    "/orders",
    response_model=list[ShopOrderResponse],
)
def get_orders(
    db: Session = Depends(get_db),
):

    service = ShopService(db)

    return service.get_orders()

@router.get(
    "/orders/today",
    response_model=list[TodayOrderResponse],
)
def get_todays_orders(
    db: Session = Depends(get_db),
):

    service = ShopService(db)

    return service.get_todays_orders()

@router.get(
    "/orders/{order_id}",
    response_model=ShopOrderDetailsResponse,
)
def get_order_details(
    order_id: UUID,
    db: Session = Depends(get_db),
):

    service = ShopService(db)

    return service.get_order_details(
        order_id
    )

@router.post(
    "/orders/{order_id}/print",
    response_model=QueueStateResponse,
)
def print_order(
    order_id: UUID,
    db: Session = Depends(get_db),
):

    service = ShopService(db)

    return service.print_order(
        order_id
    )

@router.post(
    "/orders/{order_id}/ready",
    response_model=QueueStateResponse,
)
def ready_order(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    service = ShopService(db)
    return service.mark_ready(order_id)


@router.post(
    "/orders/{order_id}/reject",
    response_model=QueueStateResponse,
)
def reject_order(
    order_id: UUID,
    request: RejectOrderRequest | None = None,
    db: Session = Depends(get_db),
):

    service = ShopService(db)

    reason = request.reason if request else None
    return service.reject_order(
        order_id,
        reason=reason,
    )

@router.post(
    "/orders/{order_id}/serve",
    response_model=QueueStateResponse,
)
def serve_order(
    order_id: UUID,
    db: Session = Depends(get_db),
):

    service = ShopService(db)

    return service.serve_order(
        order_id
    )

@router.post(
    "/orders/{order_id}/mark-served",
    response_model=QueueStateResponse,
)
def mark_served(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Mark order as SERVED from any active state.
    Called when operator clicks Print — order exits queue immediately.
    """

    service = ShopService(db)

    return service.mark_served(
        order_id
    )

@router.get(
    "/revenue/today",
    response_model=TodayRevenueResponse,
)
def get_today_revenue(

    db: Session = Depends(
        get_db
    ),

):

    service = ShopService(db)

    return (
        service
        .get_today_revenue()
    )