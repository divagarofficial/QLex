from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.platform_setting import PlatformSetting

from .repository import OrderRepository
from uuid import UUID
from app.enums.order_status import OrderStatus


class OrderService:

    def __init__(self, db: Session):

        self.db = db
        self.repository = OrderRepository(db)

    def create_draft(
        self,
        student_id,
        is_priority: bool,
    ):

        settings = self.db.query(
            PlatformSetting
        ).first()

        platform_fee = settings.platform_fee

        priority_fee = (
            settings.priority_fee
            if is_priority
            else Decimal("0.00")
        )

        order = Order(

            student_id=student_id,

            is_priority=is_priority,

            subtotal=Decimal("0.00"),

            convenience_fee=Decimal("0.00"),

            platform_fee=platform_fee,

            priority_fee=priority_fee,

            grand_total=platform_fee + priority_fee,

            draft_expires_at=datetime.utcnow()
            + timedelta(
                hours=settings.draft_expiry_hours
            ),
        )

        return self.repository.create(order)
    
    def get_order_summary(
    self,
    order_id: UUID,
):

        order = (
            self.repository
            .get_order_summary(order_id)
        )

        if order is None:

            raise ValueError(
                "Order not found."
            )

        documents = []

        for document in order.documents:

            selected_services = []

            for document_service in document.document_services:

                selected_services.append(
                    {
                        "id": document_service.service.id,
                        "name": document_service.service.name,
                        "quantity": document_service.quantity,
                        "price": document_service.price,
                        "total": document_service.total,
                    }
                )

            documents.append(
                {
                    "id": document.id,
                    "original_filename": (
                        document.original_filename
                    ),
                    "stored_filename": (
                        document.stored_filename
                    ),
                    "url": document.url,
                    "file_size": document.file_size,
                    "page_count": document.page_count,
                    "paper_size": document.paper_size,
                    "print_type": document.print_type,
                    "print_side": document.print_side,
                    "copies": document.copies,
                    "shop_price_per_page": (
                        document.shop_price_per_page
                    ),
                    "document_total": (
                        document.document_total
                    ),
                    "services": selected_services,
                }
            )

        return {
            "id": order.id,
            "student_id": order.student_id,
            "status": order.status,
            "payment_status": order.payment_status,
            "is_priority": order.is_priority,
            "subtotal": order.subtotal,
            "convenience_fee": order.convenience_fee,
            "platform_fee": order.platform_fee,
            "priority_fee": order.priority_fee,
            "grand_total": order.grand_total,
            "estimated_completion_time": (
                order.estimated_completion_time
            ),
            "draft_expires_at": (
                order.draft_expires_at
            ),
            "created_at": order.created_at,
            "documents": documents,
        }
    
    def confirm_order(
    self,
    order_id: UUID,
    is_priority: bool = False,
):

        order = self.repository.get_by_id(
            order_id
        )

        if order is None:

            raise ValueError(
                "Order not found."
            )

        if order.status != OrderStatus.DRAFT:
            if order.status == OrderStatus.PENDING_PAYMENT:
                # Order already confirmed; update priority setting if changed and return summary
                settings = self.db.query(PlatformSetting).first()
                priority_fee = (
                    settings.priority_fee
                    if (is_priority and settings)
                    else Decimal("0.00")
                )
                order.is_priority = is_priority
                order.priority_fee = priority_fee
                order.grand_total = (
                    (order.subtotal or Decimal("0.00"))
                    + (order.convenience_fee or Decimal("0.00"))
                    + (order.platform_fee or Decimal("0.00"))
                    + priority_fee
                )
                self.db.commit()
                self.db.refresh(order)
                return self.get_order_summary(order_id)

            raise ValueError(
                "Only draft orders can be confirmed."
            )

        if (
            order.draft_expires_at is not None
            and order.draft_expires_at
            < datetime.now(
                order.draft_expires_at.tzinfo
            )
        ):

            order.status = OrderStatus.EXPIRED

            self.db.commit()

            raise ValueError(
                "This draft order has expired."
            )

        if not order.documents:

            raise ValueError(
                "Upload at least one document "
                "before confirming the order."
            )

        for document in order.documents:

            if (
                document.document_total is None
                or document.document_total
                <= Decimal("0.00")
            ):

                raise ValueError(
                    f"Configure print options for "
                    f"{document.original_filename} "
                    "before confirming the order."
                )

        # Apply priority flag and recalculate fees
        settings = self.db.query(
            PlatformSetting
        ).first()

        priority_fee = (
            settings.priority_fee
            if is_priority
            else Decimal("0.00")
        )

        order.is_priority = is_priority
        order.priority_fee = priority_fee
        order.grand_total = (
            order.subtotal
            + order.convenience_fee
            + order.platform_fee
            + priority_fee
        )

        if (
            order.grand_total is None
            or order.grand_total
            <= Decimal("0.00")
        ):

            raise ValueError(
                "Order total must be greater "
                "than zero."
            )

        order.status = (
            OrderStatus.PENDING_PAYMENT
        )

        self.db.commit()

        self.db.refresh(order)

        return order