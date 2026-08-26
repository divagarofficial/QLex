import math
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.enums.order_status import OrderStatus
from app.enums.queue_state import QueueState
from app.enums.queue_type import QueueType
from app.models.order import Order
from app.models.shop_queue import ShopQueue


def calculate_order_estimated_time(db: Session, order: Order) -> dict:
    """
    Calculates dynamic estimated wait time in minutes and estimated completion datetime
    for a given order based on document page counts, print setup overhead, and queue position.
    """
    if not order:
        return {
            "estimated_wait_minutes": 0,
            "estimated_completion_time": None,
        }

    status_str = (
        order.status.value if hasattr(order.status, "value") else str(order.status)
    ).upper()

    # Terminal states -> 0 wait time
    if status_str in [
        "COMPLETED",
        "SERVED",
        "READY_FOR_PICKUP",
        "READY",
        "CANCELLED",
        "EXPIRED",
        "REJECTED",
        "PAYMENT_FAILED",
    ]:
        return {
            "estimated_wait_minutes": 0,
            "estimated_completion_time": order.updated_at or order.created_at,
        }

    # Fetch shop queue entry if present
    queue = getattr(order, "shop_queue", None)
    if not queue:
        queue = db.query(ShopQueue).filter(ShopQueue.order_id == order.id).first()

    queue_state_str = (
        queue.queue_state.value
        if (queue and hasattr(queue.queue_state, "value"))
        else (str(queue.queue_state).upper() if queue else status_str)
    )

    now = datetime.utcnow()

    # Currently PRINTING state
    if queue_state_str in ["PRINTING", "IN_PROGRESS"]:
        if queue and queue.ready_at and queue.ready_at > now:
            rem_seconds = (queue.ready_at - now).total_seconds()
            estimated_wait = max(1, math.ceil(rem_seconds / 60))
        else:
            # Estimate based on this order's document page count
            pages = 0
            if order.documents:
                for doc in order.documents:
                    p = doc.page_count or 1
                    c = doc.copies or 1
                    pages += p * c
            else:
                pages = 5
            # 3 seconds per page + 30 seconds setup
            print_sec = (pages * 3) + 30
            estimated_wait = max(1, math.ceil(print_sec / 60))

        completion_time = now + timedelta(minutes=estimated_wait)
        return {
            "estimated_wait_minutes": estimated_wait,
            "estimated_completion_time": completion_time,
        }

    # Active Queue States (WAITING / PAID / ACCEPTED / DRAFT / PENDING_PAYMENT)
    target_shop_name = getattr(order, "shop_name", "") or ""
    is_satellite = "Satellite" in target_shop_name
    is_priority = getattr(order, "is_priority", False)

    target_date = (
        queue.created_at.date()
        if (queue and queue.created_at)
        else (order.created_at.date() if order.created_at else date.today())
    )
    target_created = (
        queue.created_at
        if (queue and queue.created_at)
        else (order.created_at if order.created_at else now)
    )

    # Collect queue entries ahead of this order
    queues_ahead = []

    if is_satellite:
        queues_ahead = (
            db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == target_date,
                ShopQueue.queue_type == QueueType.SATELLITE,
                ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING]),
                ShopQueue.created_at < target_created,
            )
            .all()
        )
    elif is_priority:
        queues_ahead = (
            db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == target_date,
                ShopQueue.queue_type == QueueType.PRIORITY,
                ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING]),
                ShopQueue.created_at < target_created,
            )
            .all()
        )
    else:
        pri_waiting = (
            db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == target_date,
                ShopQueue.queue_type == QueueType.PRIORITY,
                ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING]),
            )
            .all()
        )
        reg_ahead = (
            db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == target_date,
                ShopQueue.queue_type == QueueType.REGULAR,
                ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING]),
                ShopQueue.created_at < target_created,
            )
            .all()
        )
        queues_ahead = pri_waiting + reg_ahead

    total_wait_seconds = 0

    # Calculate print time for all orders ahead
    for q_ahead in queues_ahead:
        ahead_order = getattr(q_ahead, "order", None)
        if not ahead_order:
            ahead_order = db.query(Order).filter(Order.id == q_ahead.order_id).first()

        pages_ahead = 0
        if ahead_order and ahead_order.documents:
            for doc in ahead_order.documents:
                p = doc.page_count or 1
                c = doc.copies or 1
                pages_ahead += p * c
        else:
            pages_ahead = 5

        # 3 seconds per page + 45 seconds per order handling
        total_wait_seconds += (pages_ahead * 3) + 45

    # Add print time for this order itself
    my_pages = 0
    if order.documents:
        for doc in order.documents:
            p = doc.page_count or 1
            c = doc.copies or 1
            my_pages += p * c
    else:
        my_pages = 5

    total_wait_seconds += (my_pages * 3) + 45

    estimated_wait = max(1, math.ceil(total_wait_seconds / 60))
    completion_time = now + timedelta(minutes=estimated_wait)

    return {
        "estimated_wait_minutes": estimated_wait,
        "estimated_completion_time": completion_time,
    }
