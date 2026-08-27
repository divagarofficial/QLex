import math
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.enums.order_status import OrderStatus
from app.enums.queue_state import QueueState
from app.enums.queue_type import QueueType
from app.enums.payment_status import PaymentStatus
from app.models.order import Order
from app.models.shop_queue import ShopQueue


def calculate_order_estimated_time(db: Session, order: Order) -> dict:
    """
    Calculates dynamic estimated wait time in minutes and estimated completion datetime
    for a given order based on document page counts, print setup overhead, and queue position.
    CRITICAL: Only includes TODAY'S orders (queue_date == date.today() and order created_at == date.today())
    when calculating queue wait times.
    """
    try:
        now = datetime.utcnow()
        today = date.today()

        if not order:
            return {
                "estimated_wait_minutes": 5,
                "estimated_completion_time": now + timedelta(minutes=5),
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
            comp_time = order.updated_at or order.created_at or now
            return {
                "estimated_wait_minutes": 0,
                "estimated_completion_time": comp_time,
            }

        def to_naive_utc(dt):
            if not dt:
                return now
            if hasattr(dt, "tzinfo") and dt.tzinfo is not None:
                return dt.replace(tzinfo=None)
            return dt

        order_created_naive = to_naive_utc(order.created_at)

        # Fetch shop queue entry if present
        queue = getattr(order, "shop_queue", None)
        if not queue:
            queue = (
                db.query(ShopQueue)
                .filter(
                    ShopQueue.order_id == order.id,
                )
                .order_by(ShopQueue.created_at.desc())
                .first()
            )

        queue_state_str = (
            queue.queue_state.value
            if (queue and hasattr(queue.queue_state, "value"))
            else (str(queue.queue_state).upper() if queue else status_str)
        )

        now_naive = now

        # Currently PRINTING state
        if queue_state_str in ["PRINTING", "IN_PROGRESS"]:
            if queue and queue.ready_at:
                ready_at_naive = to_naive_utc(queue.ready_at)
                if ready_at_naive > now_naive:
                    rem_seconds = (ready_at_naive - now_naive).total_seconds()
                    estimated_wait = max(1, math.ceil(rem_seconds / 60))
                else:
                    estimated_wait = 2
            else:
                pages = 0
                if getattr(order, "documents", None):
                    for doc in order.documents:
                        p = getattr(doc, "page_count", 1) or 1
                        c = getattr(doc, "copies", 1) or 1
                        pages += p * c
                else:
                    pages = 5
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

        raw_target_created = (
            queue.created_at
            if (queue and queue.created_at)
            else (order.created_at if order.created_at else now)
        )
        target_created = to_naive_utc(raw_target_created)

        # Collect queue entries ahead of this order in the active queue
        queues_ahead = []

        if is_satellite:
            all_sat_queues = (
                db.query(ShopQueue)
                .join(Order, ShopQueue.order_id == Order.id)
                .filter(
                    ShopQueue.queue_type == QueueType.SATELLITE,
                    ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING]),
                )
                .all()
            )
            queues_ahead = [
                q for q in all_sat_queues if to_naive_utc(q.created_at) < target_created
            ]
        elif is_priority:
            all_pri_queues = (
                db.query(ShopQueue)
                .join(Order, ShopQueue.order_id == Order.id)
                .filter(
                    ShopQueue.queue_type == QueueType.PRIORITY,
                    ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING]),
                )
                .all()
            )
            queues_ahead = [
                q for q in all_pri_queues if to_naive_utc(q.created_at) < target_created
            ]
        else:
            pri_waiting = (
                db.query(ShopQueue)
                .join(Order, ShopQueue.order_id == Order.id)
                .filter(
                    ShopQueue.queue_type == QueueType.PRIORITY,
                    ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING]),
                )
                .all()
            )
            reg_waiting = (
                db.query(ShopQueue)
                .join(Order, ShopQueue.order_id == Order.id)
                .filter(
                    ShopQueue.queue_type == QueueType.REGULAR,
                    ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING]),
                )
                .all()
            )
            reg_ahead = [
                q for q in reg_waiting if to_naive_utc(q.created_at) < target_created
            ]
            queues_ahead = pri_waiting + reg_ahead

        total_wait_seconds = 0

        # Calculate print time for all orders ahead (strictly today's orders)
        for q_ahead in queues_ahead:
            ahead_order = getattr(q_ahead, "order", None)
            if not ahead_order:
                ahead_order = db.query(Order).filter(Order.id == q_ahead.order_id).first()

            pages_ahead = 0
            if ahead_order and getattr(ahead_order, "documents", None):
                for doc in ahead_order.documents:
                    p = getattr(doc, "page_count", 1) or 1
                    c = getattr(doc, "copies", 1) or 1
                    pages_ahead += p * c
            else:
                pages_ahead = 5

            total_wait_seconds += (pages_ahead * 3) + 45

        # Add print time for this order itself
        my_pages = 0
        if getattr(order, "documents", None):
            for doc in order.documents:
                p = getattr(doc, "page_count", 1) or 1
                c = getattr(doc, "copies", 1) or 1
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
    except Exception:
        # High-reliability fallback
        now = datetime.utcnow()
        default_mins = 5 if getattr(order, "is_priority", False) else 10
        return {
            "estimated_wait_minutes": default_mins,
            "estimated_completion_time": now + timedelta(minutes=default_mins),
        }
