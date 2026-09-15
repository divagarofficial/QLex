from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.enums.order_status import OrderStatus
from app.enums.payment_status import PaymentStatus
from app.models.order import Order
from app.models.platform_setting import PlatformSetting
from app.models.shop_model import Shop
from app.models.shop_queue import ShopQueue
from app.orders.express_schemas import (
    CreateExpressDraftRequest,
    ExpressDraftResponse,
    ExpressOrderStatusResponse,
    PublicShopResponse,
    ShopRegisterRequest,
)
from app.orders.service import OrderService
from app.orders.upload_schemas import (
    DocumentResponse,
    UpdateDocumentRequest,
    UploadResponse,
)
from app.orders.upload_service import UploadService
from app.utils.estimated_time import calculate_order_estimated_time

router = APIRouter(
    tags=["Express Ordering"],
)


@router.get(
    "/shops/public",
    response_model=list[PublicShopResponse],
)
def list_public_shops(
    db: Session = Depends(get_db),
):
    """
    Returns list of all active shops across the platform.
    """
    shops = db.query(Shop).filter(Shop.is_active == True).all()
    return shops


@router.get(
    "/shops/public/{slug}",
    response_model=PublicShopResponse,
)
def get_public_shop_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """
    Resolves a shop by its unique URL slug (e.g. 'acme' or 'rit').
    """
    shop = db.query(Shop).filter(Shop.slug == slug.lower(), Shop.is_active == True).first()
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shop '{slug}' not found.",
        )
    return shop


@router.post(
    "/shops/public/register",
    response_model=PublicShopResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_new_shop(
    payload: ShopRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Registers a new print shop in the QLex multi-shop platform.
    Auto-generates a clean slug if not explicitly provided.
    """
    import re
    
    name_clean = payload.name.strip()
    if payload.slug and payload.slug.strip():
        slug_clean = re.sub(r"[^a-z0-9\-]", "", payload.slug.strip().lower())
    else:
        slug_clean = re.sub(r"[^a-z0-9]+", "-", name_clean.lower()).strip("-")
    
    if not slug_clean:
        slug_clean = f"shop-{int(datetime.utcnow().timestamp())}"

    # Check for existing shop slug
    existing = db.query(Shop).filter(Shop.slug == slug_clean).first()
    if existing:
        # If slug exists, append a unique suffix
        suffix = int(datetime.utcnow().timestamp()) % 10000
        slug_clean = f"{slug_clean}-{suffix}"

    new_shop = Shop(
        name=name_clean,
        slug=slug_clean,
        tagline=payload.tagline.strip() if payload.tagline else f"Official Print Hub for {name_clean}",
        description=payload.description.strip() if payload.description else f"{name_clean} - High quality print & scan services.",
        address=payload.address.strip() if payload.address else None,
        phone=payload.phone.strip() if payload.phone else None,
        email=payload.email.strip() if payload.email else None,
        upi_id=payload.upi_id.strip() if payload.upi_id else None,
        operating_hours=payload.operating_hours.strip() if payload.operating_hours else "8:00 AM - 8:00 PM",
        is_express_enabled=payload.is_express_enabled,
        requires_account=payload.requires_account,
        is_active=True,
    )

    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)
    return new_shop



@router.post(
    "/orders/express/create",
    response_model=ExpressDraftResponse,
)
def create_express_draft(
    request: CreateExpressDraftRequest,
    db: Session = Depends(get_db),
):
    """
    Creates an express draft order for a guest customer using solely their phone number.
    Only permitted for shops with is_express_enabled=True.
    """
    clean_slug = request.shop_slug.strip().lower()
    shop = db.query(Shop).filter(Shop.slug == clean_slug, Shop.is_active == True).first()

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shop '{request.shop_slug}' not found.",
        )

    if not shop.is_express_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{shop.name} is a campus college hub and requires student register number login.",
        )

    platform_settings = db.query(PlatformSetting).first()
    platform_fee = platform_settings.platform_fee if platform_settings else Decimal("0.00")
    priority_fee = platform_settings.priority_fee if (request.is_priority and platform_settings) else Decimal("0.00")

    order = Order(
        student_id=None,
        is_guest_order=True,
        guest_phone=request.phone.strip(),
        guest_name=request.full_name.strip() if request.full_name else None,
        shop_slug=shop.slug,
        shop_name=shop.name,
        status=OrderStatus.DRAFT,
        payment_status=PaymentStatus.PENDING,
        is_priority=request.is_priority,
        subtotal=Decimal("0.00"),
        convenience_fee=Decimal("0.00"),
        platform_fee=platform_fee,
        priority_fee=priority_fee,
        grand_total=platform_fee + priority_fee,
        draft_expires_at=datetime.utcnow() + timedelta(hours=24),
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return ExpressDraftResponse(
        order_id=order.id,
        shop_name=shop.name,
        shop_slug=shop.slug,
        guest_phone=order.guest_phone,
        guest_name=order.guest_name,
        status=order.status.value,
        created_at=order.created_at,
    )


@router.post(
    "/orders/express/{order_id}/documents",
    response_model=UploadResponse,
)
async def upload_express_documents(
    order_id: UUID,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """
    Uploads documents for a guest express order.
    """
    service = UploadService(db)
    docs = await service.upload_documents(
        order_id=order_id,
        files=files,
    )
    return {"documents": docs}


@router.put(
    "/orders/express/{order_id}/documents/{document_id}",
    response_model=DocumentResponse,
)
async def update_express_document_settings(
    order_id: UUID,
    document_id: UUID,
    request: UpdateDocumentRequest,
    db: Session = Depends(get_db),
):
    """
    Updates print settings (color/mono, sides, copies, pages) for a guest document.
    """
    service = UploadService(db)
    return await service.update_document(
        order_id=order_id,
        document_id=document_id,
        request=request,
    )


@router.delete(
    "/orders/express/{order_id}/documents/{document_id}",
)
async def delete_express_document(
    order_id: UUID,
    document_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Deletes an uploaded document from a guest order draft.
    """
    service = UploadService(db)
    return await service.delete_document(
        order_id=order_id,
        document_id=document_id,
    )


@router.get(
    "/orders/express/{order_id}/summary",
)
def get_express_order_summary(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Returns complete bill summary, items, and calculated prices for the guest order.
    """
    service = OrderService(db)
    return service.get_order_summary(order_id=order_id)


@router.post(
    "/orders/express/{order_id}/confirm",
)
def confirm_express_order(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Confirms the guest order, finalizing totals before online payment initiation.
    """
    service = OrderService(db)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return service.confirm_order(
        order_id=order_id,
        is_priority=order.is_priority,
    )


@router.get(
    "/orders/express/{order_id}/status",
    response_model=ExpressOrderStatusResponse,
)
def get_express_order_status(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Public tracking endpoint used by customer live status screens and WhatsApp links.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    queue = db.query(ShopQueue).filter(ShopQueue.order_id == order.id).first()
    token_number = queue.token if queue else None
    queue_state = (
        queue.queue_state.value if queue and hasattr(queue.queue_state, "value") else (str(queue.queue_state) if queue else None)
    )

    shop = db.query(Shop).filter(Shop.slug == order.shop_slug).first() if order.shop_slug else None

    # Calculate estimated wait time
    est = calculate_order_estimated_time(db, order)
    estimated_wait_minutes = est.get("estimated_wait_minutes", 5)

    # Calculate total pages
    total_pages = sum(getattr(doc, "page_count", 0) * getattr(doc, "copies", 1) for doc in order.documents)

    return ExpressOrderStatusResponse(
        order_id=order.id,
        token_number=token_number,
        queue_state=queue_state,
        status=order.status.value,
        payment_status=order.payment_status.value,
        shop_name=order.shop_name,
        shop_slug=order.shop_slug,
        shop_address=shop.address if shop else None,
        shop_phone=shop.phone if shop else None,
        estimated_wait_minutes=estimated_wait_minutes,
        guest_phone=order.guest_phone,
        guest_name=order.guest_name,
        grand_total=order.grand_total,
        documents_count=len(order.documents),
        total_pages=total_pages,
        created_at=order.created_at,
    )
