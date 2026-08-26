from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.shop_queue import ShopQueue

from app.enums.queue_state import QueueState
from app.enums.queue_type import QueueType
from app.enums.order_status import OrderStatus

from sqlalchemy import func
from app.models.order_document import OrderDocument
from app.models.payment import Payment



class StudentRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_active_token(
        self,
        student_id: UUID,
    ):
        return (
            self.db.query(ShopQueue)
            .join(
                Order,
                ShopQueue.order_id == Order.id,
            )
            .filter(
                Order.student_id == student_id,
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state.notin_(
                    [
                        QueueState.SERVED,
                        QueueState.REJECTED,
                    ]
                ),
            )
            .order_by(ShopQueue.created_at.desc())
            .first()
        )

    def get_latest_active_order(
        self,
        student_id: UUID,
    ):
        return (
            self.db.query(Order)
            .filter(
                Order.student_id == student_id,
                func.date(Order.created_at) == date.today(),
                Order.status != OrderStatus.DRAFT,
            )
            .order_by(Order.created_at.desc())
            .first()
        )

    def get_queue(
        self,
        order_id,
    ):
        return (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.order_id == order_id,
            )
            .first()
        )

    def get_current_printing(self):
        # Priority 1: Queue entry in PRINTING state for today (Central Hub only: Priority or Regular)
        printing = (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state == QueueState.PRINTING,
                ShopQueue.queue_type.in_([QueueType.PRIORITY, QueueType.REGULAR]),
            )
            .order_by(ShopQueue.created_at.asc())
            .first()
        )
        if printing:
            return printing

        # Priority 2: Fallback to active order in PRINTING state (Central Hub only)
        from app.models.order import Order as OrderModel
        from app.enums.order_status import OrderStatus
        active_printing = (
            self.db.query(OrderModel)
            .filter(
                OrderModel.status == OrderStatus.PRINTING,
                func.date(OrderModel.created_at) == date.today(),
                ~OrderModel.shop_name.ilike("%Satellite%"),
            )
            .first()
        )
        if active_printing and active_printing.shop_queue and active_printing.shop_queue.queue_type != QueueType.SATELLITE:
            return active_printing.shop_queue

        return None

    def get_priority_queue(self):
        return (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_type == QueueType.PRIORITY,
                ShopQueue.queue_state == QueueState.WAITING,
                ShopQueue.is_current == False,
            )
            .order_by(ShopQueue.queue_number.asc())
            .all()
        )

    def get_regular_queue(self):
        return (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_type == QueueType.REGULAR,
                ShopQueue.queue_state == QueueState.WAITING,
                ShopQueue.is_current == False,
            )
            .order_by(ShopQueue.queue_number.asc())
            .all()
        )

    def get_orders(
        self,
        student_id: UUID,
    ):
        from app.shop.queue_service import ShopQueueService
        queue_service = ShopQueueService(self.db)

        orders = (
            self.db.query(Order)
            .filter(Order.student_id == student_id)
            .order_by(Order.created_at.desc())
            .all()
        )

        result = []
        for order in orders:
            queue = (
                self.db.query(ShopQueue)
                .filter(
                    ShopQueue.order_id == order.id,
                )
                .first()
            )
            from app.enums.payment_status import PaymentStatus
            if not queue and order.status not in [OrderStatus.DRAFT, OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.EXPIRED, OrderStatus.PAYMENT_FAILED] and getattr(order, "payment_status", None) == PaymentStatus.PAID and order.created_at and hasattr(order.created_at, "date") and order.created_at.date() == date.today():
                queue = queue_service.create_queue_entry(order)
            token = queue.token if queue else None

            if not token and getattr(order, "payment_status", None) == PaymentStatus.PAID:
                prefix = "P" if order.is_priority else "R"
                target_date = order.created_at.date() if (order.created_at and hasattr(order.created_at, "date")) else date.today()
                seq_num = (
                    self.db.query(Order)
                    .filter(
                        Order.is_priority == order.is_priority,
                        func.date(Order.created_at) >= target_date,
                        Order.created_at <= (order.created_at if order.created_at else func.now()),
                    )
                    .count()
                )
                token = f"{prefix}-{max(1, seq_num)}"

            doc_count = len(order.documents) if order.documents else 0
            result.append((order, token, doc_count))

        return result

    def get_order_details(
        self,
        student_id,
        order_id,
    ):
        return (
            self.db.query(Order)
            .filter(
                Order.id == order_id,
                Order.student_id == student_id,
            )
            .first()
        )

    def get_order_documents(
        self,
        order_id,
    ):
        return (
            self.db.query(OrderDocument)
            .filter(OrderDocument.order_id == order_id)
            .all()
        )

    def get_payments(
        self,
        student_id: UUID,
    ):
        return (
            self.db.query(
                Order,
                Payment,
                ShopQueue.token,
            )
            .outerjoin(
                Payment,
                Payment.order_id == Order.id,
            )
            .outerjoin(
                ShopQueue,
                (ShopQueue.order_id == Order.id) & (ShopQueue.queue_date == date.today()),
            )
            .filter(
                Order.student_id == student_id,
            )
            .order_by(
                Order.created_at.desc()
            )
            .all()
        )