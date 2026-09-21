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


# ===================================================
# DECENTRO INSTANT T+0 SETTLEMENT ENDPOINTS
# ===================================================

@router.post(
    "/{order_id}/payments/decentro-intent",
)
def create_decentro_payment_intent(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Generates dynamic Decentro UPI link & QR code for Instant T+0 Settlement.
    """
    from app.orders.repository import OrderRepository
    from .decentro_client import DecentroClient

    order_repo = OrderRepository(db)
    order = order_repo.get_by_id(order_id)
    if not order:
        return {"success": False, "error": "Order not found"}

    try:
        decentro = DecentroClient()
        result = decentro.generate_dynamic_upi_link(
            order_id=str(order.id),
            amount=float(order.grand_total or 0.0),
            shop_name=order.shop_name or "QLex Print Hub",
        )
    except Exception as err:
        result = {"success": False, "error": str(err)}

    if not result.get("success"):
        from .directpay_service import DirectPayService
        dp_service = DirectPayService()
        dp_result = dp_service.generate_upi_intent(
            order_id=str(order.id),
            amount=float(order.grand_total or 0.0),
            shop_name=order.shop_name or "QLex Print Hub",
        )
        return {
            "success": True,
            "order_id": order.id,
            "amount": order.grand_total,
            "decentro_txn_id": None,
            "upi_intent": dp_result.get("upi_intent_url"),
            "qr_code_url": None,
            "error": None,
            "fallback": True,
        }

    return {
        "success": True,
        "order_id": order.id,
        "amount": order.grand_total,
        "decentro_txn_id": result.get("decentro_txn_id"),
        "upi_intent": result.get("upi_intent"),
        "qr_code_url": result.get("qr_code_url"),
        "error": None,
    }


@router.post(
    "/decentro-webhook",
)
async def decentro_payment_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Decentro Auto-Verification Webhook.
    Fires instantly on UPI payment completion, marks order PAID and issues token.
    """
    from app.enums.order_status import OrderStatus
    from app.enums.payment_status import PaymentStatus
    from app.models.order import Order
    from app.shop.queue_service import ShopQueueService
    from app.services.whatsapp_service import whatsapp_service

    try:
        payload = await request.json()
    except Exception:
        return {"status": "error", "message": "Invalid JSON payload"}

    event_type = payload.get("event") or payload.get("eventType")
    data = payload.get("data", {})
    ref_id = data.get("reference_id") or payload.get("reference_id") or ""
    status = data.get("transaction_status") or payload.get("status")

    if status not in ("SUCCESS", "SUCCESSFUL", "COMPLETED"):
        return {"status": "ignored", "reason": f"Non-success status: {status}"}

    # Match order by UUID prefix or reference ID
    order_id_clean = ref_id.replace("QLX_", "")
    order = None

    if order_id_clean:
        orders = db.query(Order).filter(Order.payment_status == PaymentStatus.PENDING).all()
        for o in orders:
            if str(o.id).startswith(order_id_clean) or str(o.id) == order_id_clean:
                order = o
                break

    if not order:
        return {"status": "ignored", "reason": "No pending matching order found"}

    if order.payment_status == PaymentStatus.PAID:
        return {"status": "already_paid", "order_id": str(order.id)}

    # Mark Order PAID & Issue Token
    order.payment_status = PaymentStatus.PAID
    order.status = OrderStatus.PAID
    db.commit()

    queue_service = ShopQueueService(db)
    queue = queue_service.create_queue_entry(order)
    db.commit()

    token = queue.token if queue else "R-1"

    # Send WhatsApp confirmation receipt
    try:
        cust_name = getattr(order, "guest_name", None) or (order.student.full_name if getattr(order, "student", None) else "Customer")
        cust_phone = getattr(order, "guest_phone", None) or (order.student.phone if getattr(order, "student", None) else "")
        if cust_phone:
            whatsapp_service.send_order_placed_receipt(
                db=db,
                order=order,
                student_name=cust_name,
                phone=cust_phone,
                shop_name=order.shop_name or "QLex Print Hub",
                token_number=token,
                grand_total=order.grand_total,
            )
    except Exception as w_err:
        print(f"[Decentro Webhook Warning] WhatsApp notification failed: {w_err}")

    return {
        "status": "success",
        "message": "Payment auto-verified via Decentro Webhook",
        "order_id": str(order.id),
        "token": token,
    }


# ===================================================
# QLEX DIRECTPAY (AIRTEL PAYMENTS BANK T+0 ENDPOINTS)
# ===================================================

@router.post(
    "/{order_id}/payments/directpay-intent",
)
def create_directpay_intent(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Generates dynamic pre-filled NPCI UPI Intent link for Airtel Payments Bank (thirudiva@upi).
    Displays Payee Name as 'MINDURA TECHNOLOGIES'.
    """
    from app.orders.repository import OrderRepository
    from .directpay_service import DirectPayService

    order_repo = OrderRepository(db)
    order = order_repo.get_by_id(order_id)
    if not order:
        return {"success": False, "error": "Order not found"}

    directpay = DirectPayService()
    result = directpay.generate_upi_intent(
        order_id=str(order.id),
        amount=float(order.grand_total or 0.0),
        shop_name=order.shop_name or "QLex Print Hub",
    )

    return result


@router.post(
    "/directpay-relay",
)
async def directpay_notification_relay(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Auto-verifies payments when Airtel Payments Bank or PhonePe SMS notification
    relays incoming payment alert to QLex backend.
    """
    from app.enums.order_status import OrderStatus
    from app.enums.payment_status import PaymentStatus
    from app.models.order import Order
    from app.shop.queue_service import ShopQueueService
    from app.services.whatsapp_service import whatsapp_service

    from .directpay_service import DirectPayService
    directpay = DirectPayService()

    sms_text = payload.get("sms_text") or payload.get("body") or payload.get("message")
    amount = payload.get("amount")
    ref_code = payload.get("reference_code") or payload.get("ref") or ""

    if sms_text:
        parsed = directpay.parse_airtel_sms(sms_text)
        if parsed.get("amount"):
            amount = parsed["amount"]
        if parsed.get("reference_code"):
            ref_code = parsed["reference_code"]

    # 1. Match pending order by reference code or amount

    pending_order = None
    if ref_code:
        clean_ref = ref_code.replace("QLX_", "")
        pending_orders = db.query(Order).filter(Order.payment_status == PaymentStatus.PENDING).all()
        for o in pending_orders:
            if str(o.id).startswith(clean_ref):
                pending_order = o
                break

    if not pending_order and amount:
        pending_order = (
            db.query(Order)
            .filter(
                Order.payment_status == PaymentStatus.PENDING,
                Order.grand_total == float(amount),
            )
            .order_by(Order.created_at.desc())
            .first()
        )

    if not pending_order:
        return {"status": "unmatched", "message": "No pending matching order found"}

    if pending_order.payment_status == PaymentStatus.PAID:
        return {"status": "already_paid", "order_id": str(pending_order.id)}

    # 2. Update Order & Issue Queue Token
    pending_order.payment_status = PaymentStatus.PAID
    pending_order.status = OrderStatus.PAID
    db.commit()

    queue_service = ShopQueueService(db)
    queue = queue_service.create_queue_entry(pending_order)
    db.commit()

    token = queue.token if queue else "R-1"

    # Send WhatsApp confirmation receipt
    try:
        cust_name = getattr(pending_order, "guest_name", None) or (pending_order.student.full_name if getattr(pending_order, "student", None) else "Customer")
        cust_phone = getattr(pending_order, "guest_phone", None) or (pending_order.student.phone if getattr(pending_order, "student", None) else "")
        if cust_phone:
            whatsapp_service.send_order_placed_receipt(
                db=db,
                order=pending_order,
                student_name=cust_name,
                phone=cust_phone,
                shop_name=pending_order.shop_name or "QLex Print Hub",
                token_number=token,
                grand_total=pending_order.grand_total,
            )
    except Exception as w_err:
        print(f"[DirectPay Relay Warning] WhatsApp notification failed: {w_err}")

    return {
        "status": "success",
        "message": "Payment auto-verified via Airtel DirectPay Relay",
        "order_id": str(pending_order.id),
        "token": token,
    }
