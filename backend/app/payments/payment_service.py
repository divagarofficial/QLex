from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.enums.order_status import OrderStatus
from app.enums.payment_status import PaymentStatus
from app.models.payment import Payment
from app.orders.repository import OrderRepository

from .payment_repository import PaymentRepository
from app.core.config import settings
from .razorpay_client import RazorpayClient
#===================================================
#WEBHOOK
#===================================================
import json
#===================================================    
#EXCEPTION
#===================================================
from fastapi import HTTPException
#====================================================
#QUEUE INTEGRATION
#====================================================
from app.shop.queue_service import ShopQueueService

class PaymentService:

    def __init__(
        self,
        db: Session,
    ):

        self.db = db

        self.order_repository = (
            OrderRepository(db)
        )

        self.payment_repository = (
            PaymentRepository(db)
        )

        self.razorpay = RazorpayClient()


    def create_payment(
        self,
        order_id: UUID,
    ):
        order = self.order_repository.get_by_id(order_id)
        if order is None:
            raise ValueError("Order not found.")

        # Auto-advance draft order to PENDING_PAYMENT if needed
        if order.status == OrderStatus.DRAFT:
            order.status = OrderStatus.PENDING_PAYMENT
            self.db.commit()
            self.db.refresh(order)

        # If order is already paid, return existing payment or success info
        if order.payment_status == PaymentStatus.PAID or order.status == OrderStatus.PAID:
            existing_payment = self.payment_repository.get_latest_for_order(order_id)
            return {
                "payment_id": existing_payment.id if existing_payment else uuid4(),
                "order_id": order.id,
                "amount": order.grand_total,
                "currency": "INR",
                "status": PaymentStatus.PAID,
                "gateway": "razorpay",
                "razorpay_order_id": existing_payment.gateway_order_id if existing_payment else "",
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            }

        if order.grand_total is None or order.grand_total <= Decimal("0.00"):
            raise ValueError("Order amount must be greater than zero.")

        # Check for existing pending payment
        existing_payment = self.payment_repository.get_latest_for_order(order_id)
        if existing_payment is not None and existing_payment.status == PaymentStatus.PENDING:
            return {
                "payment_id": existing_payment.id,
                "order_id": existing_payment.order_id,
                "amount": existing_payment.amount,
                "currency": "INR",
                "status": existing_payment.status,
                "gateway": existing_payment.gateway,
                "razorpay_order_id": existing_payment.gateway_order_id,
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            }

        # Create fresh Razorpay Order
        amount_in_paise = int(Decimal(order.grand_total) * 100)
        razorpay_order = self.razorpay.create_order(
            amount=amount_in_paise,
            receipt=str(order.id),
        )

        payment = Payment(
            order_id=order.id,
            amount=order.grand_total,
            status=PaymentStatus.PENDING,
            gateway="razorpay",
            gateway_order_id=razorpay_order["id"],
        )
        payment = self.payment_repository.create(payment)

        return {
            "payment_id": payment.id,
            "order_id": payment.order_id,
            "amount": payment.amount,
            "currency": "INR",
            "status": payment.status,
            "gateway": payment.gateway,
            "razorpay_order_id": razorpay_order["id"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        }

    def verify_payment(
        self,
        request,
    ):
        payment = self.payment_repository.get_by_gateway_order_id(request.razorpay_order_id)
        if payment is None:
            raise ValueError("Payment record not found.")

        order = self.order_repository.get_by_id(payment.order_id)
        if order is None:
            raise ValueError("Order associated with payment not found.")

        # Prevent duplicate verification
        if payment.status == PaymentStatus.PAID:
            queue_service = ShopQueueService(self.db)
            queue = queue_service.create_queue_entry(order)
            token = queue.token if queue else "P-1"
            queue_number = queue.queue_number if queue else 1
            return {
                "success": True,
                "payment_id": payment.id,
                "order_id": order.id,
                "token": token,
                "queue_number": queue_number,
                "payment_status": payment.status,
                "order_status": order.status,
            }

        # Verify Razorpay signature
        try:
            self.razorpay.verify_signature(
                razorpay_order_id=request.razorpay_order_id,
                razorpay_payment_id=request.razorpay_payment_id,
                razorpay_signature=request.razorpay_signature,
            )
        except Exception as sig_err:
            raise ValueError(f"Invalid payment signature: {sig_err}")

        try:
            # 1. Update Payment & Order to PAID and commit first
            payment.gateway_payment_id = request.razorpay_payment_id
            payment.gateway_signature = request.razorpay_signature
            payment.status = PaymentStatus.PAID

            order.payment_status = PaymentStatus.PAID
            order.status = OrderStatus.PAID

            self.db.commit()
            self.db.refresh(payment)
            self.db.refresh(order)

            # 2. Create Shop Queue Entry after committing paid order state
            queue_service = ShopQueueService(self.db)
            queue = queue_service.create_queue_entry(order)
            if queue:
                self.db.refresh(queue)

            token = queue.token if queue else "R-1"
            queue_number = queue.queue_number if queue else 1

        except Exception as err:
            self.db.rollback()
            raise ValueError(f"Failed to process payment completion: {err}")

        return {
            "success": True,
            "payment_id": payment.id,
            "order_id": order.id,
            "token": token,
            "queue_number": queue_number,
            "payment_status": payment.status,
            "order_status": order.status,
        }
    #============================================
    #WEBHOOK
    #============================================
    async def handle_webhook(
    self,
    request,
):

        body = await request.body()

        signature = request.headers.get(
            "X-Razorpay-Signature"
        )

        if signature is None:

            raise HTTPException(
    status_code=400,
    detail="Missing webhook signature.",
)

        try:

            self.razorpay.verify_webhook_signature(
                body.decode(),
                signature,
            )

        except Exception:

            raise HTTPException(
    status_code=400,
    detail="Invalid webhook signature.",
)

        payload = json.loads(body)

        event = payload.get("event")

        if event != "payment.captured":

            return {
                "success": True
            }

        payment_entity = payload["payload"]["payment"]["entity"]

        razorpay_order_id = payment_entity["order_id"]

        razorpay_payment_id = payment_entity["id"]

        payment = (
        self.payment_repository
        .get_by_gateway_order_id(
            razorpay_order_id
        )
    )

        if payment is None:

            return {
                "success": True
            }

        if payment.status == PaymentStatus.PAID:
            return {
                "success": True
            }

        payment.gateway_payment_id = (
            razorpay_payment_id
        )

        payment.status = (
            PaymentStatus.PAID
        )

        order = (
            self.order_repository
            .get_by_id(
                payment.order_id
            )
        )

        order.payment_status = (
            PaymentStatus.PAID
        )

        order.status = (
            OrderStatus.PAID
        )

        queue_service = ShopQueueService(
            self.db
        )
        queue_service.create_queue_entry(
            order
        )

        self.db.commit()

        return {
            "success": True
        }