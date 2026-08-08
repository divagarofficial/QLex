from datetime import date

from sqlalchemy.orm import Session

from app.enums.queue_state import QueueState
from app.enums.queue_type import QueueType
from app.models.shop_queue import ShopQueue

from .queue_counter_service import QueueCounterService
from .queue_repository import ShopQueueRepository


class ShopQueueService:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db
        self.repository = ShopQueueRepository(db)
        self.counter_service = QueueCounterService(db)

    def cleanup_previous_days_queue(self):
        """
        Removes all queue entries and tokens from previous days (queue_date < date.today()).
        Guarantees that each day is a 100% fresh start with queue numbers resetting to 1.
        """
        today = date.today()
        self.db.query(ShopQueue).filter(ShopQueue.queue_date < today).delete(synchronize_session=False)
        self.db.commit()

    def create_queue_entry(
        self,
        order,
    ):
        # Auto-purge queue entries from previous days first
        self.cleanup_previous_days_queue()

        existing = (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.order_id == order.id,
                ShopQueue.queue_date == date.today(),
            )
            .first()
        )
        if existing:
            return existing

        from app.enums.order_status import OrderStatus
        from app.enums.payment_status import PaymentStatus

        unpaid_statuses = [
            OrderStatus.DRAFT,
            OrderStatus.PENDING_PAYMENT,
            OrderStatus.CANCELLED,
            OrderStatus.EXPIRED,
            OrderStatus.PAYMENT_FAILED,
        ]
        if hasattr(order, "status") and order.status in unpaid_statuses:
            return None

        if hasattr(order, "payment_status") and order.payment_status != PaymentStatus.PAID:
            return None

        if order.is_priority:
            queue_type = QueueType.PRIORITY
        else:
            queue_type = QueueType.REGULAR

        queue_number = (
            self.counter_service.next_number(
                queue_type
            )
        )

        token = (
            f"P-{queue_number}"
            if queue_type == QueueType.PRIORITY
            else f"R-{queue_number}"
        )

        queue = ShopQueue(
            order_id=order.id,
            queue_date=date.today(),
            queue_type=queue_type,
            queue_number=queue_number,
            token=token,
            queue_state=QueueState.WAITING,
            is_current=False,
        )

        self.db.add(queue)
        self.db.commit()
        self.db.refresh(queue)

        # If no active current token exists for today, set this as current
        current = (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.is_current == True,
            )
            .first()
        )

        if current is None:
            queue.is_current = True
            self.db.commit()
            self.db.refresh(queue)

        return queue