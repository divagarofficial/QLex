from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.enums.payment_status import PaymentStatus
from app.enums.order_status import OrderStatus


class CreatePaymentResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    payment_id: UUID

    order_id: UUID

    amount: Decimal

    currency: str

    status: PaymentStatus

    gateway: str

    razorpay_order_id: str

    razorpay_key_id: str

class VerifyPaymentRequest(BaseModel):

    razorpay_order_id: str

    razorpay_payment_id: str

    razorpay_signature: str

class VerifyPaymentResponse(BaseModel):

    success: bool

    payment_id: UUID

    order_id: UUID

    token: str | None = None

    queue_number: int | None = None

    payment_status: PaymentStatus

    order_status: OrderStatus

class RazorpayWebhookResponse(BaseModel):

    success: bool