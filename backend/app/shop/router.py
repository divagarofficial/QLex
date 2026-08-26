from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.database import get_db

from .schemas import (
    ShopOrderResponse,
    TodayOrderResponse,
    ShopOrderDetailsResponse,
    QueueStateResponse,
    TodayRevenueResponse,
    RejectOrderRequest,
)
from .print_agent_schemas import (
    PrintJobResponse,
    JobStatusUpdateRequest,
    PrintAgentStatusResponse,
    AgentHeartbeatResponse,
)
from .service import ShopService


router = APIRouter(
    prefix="/shop",
    tags=["Shop"],
)


@router.get(
    "/print-agent/pending-jobs",
    response_model=list[PrintJobResponse],
)
def get_pending_print_jobs(
    x_shop_name: str | None = Header(None, alias="X-Shop-Name"),
    shop_name: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Called by local Print Agent daemon to fetch all pending PAID print jobs for the target shop.
    """
    target_shop = x_shop_name or shop_name
    service = ShopService(db)
    return service.get_pending_print_jobs(shop_name=target_shop)


@router.post(
    "/print-agent/jobs/{order_id}/status",
    response_model=PrintAgentStatusResponse,
)
def update_print_job_status(
    order_id: UUID,
    request: JobStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Called by local Print Agent to update job status (PRINTING, COMPLETED, FAILED).
    - COMPLETED automatically transitions order to READY_FOR_PICKUP and dispatches WhatsApp notification.
    """
    service = ShopService(db)
    return service.update_print_job_status(
        order_id=order_id,
        status=request.status,
        error_message=request.error_message,
        assigned_printer=request.assigned_printer,
    )


@router.post(
    "/print-agent/heartbeat",
)
def record_heartbeat(
    payload: dict,
):
    """
    Called by local Print Agent daemon to report live heartbeat & printer ink telemetry.
    """
    shop_name = payload.get("shop_name", "QLex Satellite Print Hub")
    printers = payload.get("printers", [])
    from .service import record_print_agent_heartbeat
    record_print_agent_heartbeat(shop_name, printers)
    return {"status": "ok"}


@router.get(
    "/print-agent/health",
)
def get_print_agent_health_status(
    shop_name: str | None = "QLex Satellite Print Hub",
):
    """
    Returns active connectivity state, ink/toner levels, and printer telemetry for the target hub.
    """
    from .service import get_print_agent_health
    return get_print_agent_health(shop_name=shop_name)




@router.get(
    "/orders",
    response_model=list[ShopOrderResponse],
)
def get_orders(
    shop_name: str | None = None,
    db: Session = Depends(get_db),
):
    service = ShopService(db)
    return service.get_orders(shop_name=shop_name)

@router.get(
    "/orders/today",
    response_model=list[TodayOrderResponse],
)
def get_todays_orders(
    shop_name: str | None = None,
    db: Session = Depends(get_db),
):
    service = ShopService(db)
    return service.get_todays_orders(shop_name=shop_name)

@router.get(
    "/orders/{order_id}",
    response_model=ShopOrderDetailsResponse,
)
def get_order_details(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    service = ShopService(db)
    return service.get_order_details(order_id)

@router.post(
    "/orders/{order_id}/print",
    response_model=QueueStateResponse,
)
def print_order(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    service = ShopService(db)
    return service.print_order(order_id)

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
    return service.serve_order(order_id)

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
    return service.mark_served(order_id)

@router.get(
    "/revenue/today",
    response_model=TodayRevenueResponse,
)
def get_today_revenue(
    shop_name: str | None = None,
    db: Session = Depends(get_db),
):
    service = ShopService(db)
    return service.get_today_revenue(shop_name=shop_name)