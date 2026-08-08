from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.orm import Session

from app.db.database import get_db

from .payment_service import PaymentService
from .schemas import CreatePaymentResponse
from .schemas import (
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)

#===================================================
#WEBHOOK
#===================================================
from fastapi import Request
from .schemas import RazorpayWebhookResponse

router = APIRouter(
    prefix="/orders",
    tags=["Payments"],
)


@router.post(
    "/{order_id}/payments/create",
    response_model=CreatePaymentResponse,
)
def create_payment(
    order_id: UUID,
    db: Session = Depends(get_db),
):

    service = PaymentService(db)

    return service.create_payment(
        order_id=order_id
    )

@router.post(
    "/verify",
    response_model=VerifyPaymentResponse,
)
def verify_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db),
):

    service = PaymentService(db)

    return service.verify_payment(request)
#===================================================
#WEBHOOK
#===================================================    

@router.post(
    "/webhook",
    response_model=RazorpayWebhookResponse,
)
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db),
):

    service = PaymentService(db)

    return await service.handle_webhook(
        request
    )