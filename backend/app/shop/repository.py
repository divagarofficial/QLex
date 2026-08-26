from sqlalchemy.orm import Session
from app.enums.order_status import OrderStatus
from app.models.order import Order
from sqlalchemy.orm import joinedload
from datetime import date
from app.models.order_document import OrderDocument
from app.models.order_document_service import OrderDocumentService
from app.models.shop_queue import ShopQueue
from app.enums.queue_state import QueueState
from sqlalchemy import func
from app.enums.payment_status import PaymentStatus


class ShopRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_active_orders(self, shop_name: str | None = None):
        query = (
            self.db.query(Order)
            .outerjoin(
                ShopQueue,
                ShopQueue.order_id == Order.id,
            )
            .filter(
                func.date(Order.created_at) == date.today(),
                Order.payment_status == PaymentStatus.PAID,
                Order.status.in_(
                    [
                        OrderStatus.PAID,
                        OrderStatus.ACCEPTED,
                        OrderStatus.PRINTING,
                        OrderStatus.READY_FOR_PICKUP,
                    ]
                ),
                ~ShopQueue.queue_state.in_(
                    [
                        QueueState.SERVED,
                        QueueState.REJECTED,
                    ]
                )
                | (ShopQueue.id == None),
            )
        )
        if shop_name:
            query = query.filter(Order.shop_name == shop_name)
        return query.order_by(Order.created_at.asc()).all()

    def get_todays_orders(self, shop_name: str | None = None):
        query = (
            self.db.query(Order)
            .options(
                joinedload(Order.documents)
            )
            .filter(
                func.date(Order.created_at) == date.today(),
                Order.payment_status == PaymentStatus.PAID,
                Order.status.in_(
                    [
                        OrderStatus.PAID,
                        OrderStatus.PRINTING,
                        OrderStatus.READY_FOR_PICKUP,
                    ]
                ),
            )
        )
        if shop_name:
            query = query.filter(Order.shop_name == shop_name)
        return query.order_by(
            Order.is_priority.desc(),
            Order.created_at.asc(),
        ).all()

    def get_order_details(self, order_id):
        return (
            self.db.query(Order)
            .options(
                joinedload(Order.documents)
                .joinedload(OrderDocument.document_services)
                .joinedload(OrderDocumentService.service)
            )
            .filter(Order.id == order_id)
            .first()
        )

    def get_queue_by_order(self, order_id):
        return (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.order_id == order_id,
                ShopQueue.queue_date == date.today(),
            )
            .first()
        )

    def get_current_order(self, shop_name: str | None = None):
        query = (
            self.db.query(ShopQueue)
            .join(Order, ShopQueue.order_id == Order.id)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.is_current == True,
            )
        )
        if shop_name:
            query = query.filter(Order.shop_name == shop_name)
        return query.first()

    def get_today_queue(self, shop_name: str | None = None):
        query = (
            self.db.query(ShopQueue)
            .join(Order, ShopQueue.order_id == Order.id)
            .options(
                joinedload(ShopQueue.order)
                .joinedload(Order.documents)
            )
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state.notin_(
                    [
                        QueueState.SERVED,
                        QueueState.REJECTED,
                    ]
                ),
            )
        )
        if shop_name:
            query = query.filter(Order.shop_name == shop_name)
        return query.order_by(
            ShopQueue.queue_type.asc(),
            ShopQueue.queue_number.asc(),
        ).all()

    def get_next_waiting_order(self, shop_name: str | None = None):
        query = (
            self.db.query(ShopQueue)
            .join(Order, ShopQueue.order_id == Order.id)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state == QueueState.WAITING,
            )
        )
        if shop_name:
            query = query.filter(Order.shop_name == shop_name)
        return query.order_by(
            ShopQueue.queue_type.asc(),
            ShopQueue.queue_number.asc(),
        ).first()

    def get_today_revenue(self, shop_name: str | None = None):
        query = (
            self.db.query(
                func.count(Order.id).label("total_orders"),
                func.coalesce(
                    func.sum(Order.subtotal),
                    0,
                ).label("total_revenue"),
            )
            .filter(func.date(Order.created_at) == date.today())
            .filter(Order.payment_status == PaymentStatus.PAID)
        )
        if shop_name:
            query = query.filter(Order.shop_name == shop_name)
        return query.first()

    def save(self):
        self.db.commit()