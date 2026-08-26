from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.db.database import get_db

from .dependencies import get_current_student
from .schemas import (
    CreateDraftOrderRequest,
    DraftOrderResponse,
)
from .service import OrderService

from .upload_service import UploadService
from .upload_schemas import UploadResponse
#printing Service
from .upload_schemas import (
    UploadResponse,
    UpdateDocumentRequest,
    DocumentResponse,
)
from .schemas import (
    CreateDraftOrderRequest,
    ConfirmOrderRequest,
    DraftOrderResponse,
    OrderSummaryResponse,
)

from app.waiting_room.middleware import waiting_room_required

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.post(
    "",
    response_model=DraftOrderResponse,
)
def create_draft(
    request: CreateDraftOrderRequest,
    student_id=Depends(get_current_student),
    db: Session = Depends(get_db),
    waiting_session = Depends(
    waiting_room_required
),
):
    service = OrderService(db)

    return service.create_draft(
        student_id=student_id,
        is_priority=request.is_priority,
    )

@router.get(
    "/{order_id}",
    response_model=OrderSummaryResponse,
)
def get_order_summary(
    order_id: UUID,
    db: Session = Depends(get_db),
):

    service = OrderService(db)

    return service.get_order_summary(
        order_id=order_id
    )

@router.post(
    "/{order_id}/confirm",
    response_model=OrderSummaryResponse,
)
def confirm_order(
    order_id: UUID,
    request: ConfirmOrderRequest,
    db: Session = Depends(get_db),
):

    service = OrderService(db)

    return service.confirm_order(
        order_id=order_id,
        is_priority=request.is_priority,
    )


@router.post(
    "/{order_id}/documents",
    response_model=UploadResponse,
)
async def upload_documents(
    order_id: UUID,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    service = UploadService(db)

    documents = await service.upload_documents(
        order_id=order_id,
        files=files,
    )

    return {
        "documents": documents,
    }

@router.patch(
    "/{order_id}/documents/{document_id}",
    response_model=DocumentResponse,
)
async def update_document(
    order_id: UUID,
    document_id: UUID,
    request: UpdateDocumentRequest,
    db: Session = Depends(get_db),
):

    service = UploadService(db)

    return await service.update_document(
        order_id=order_id,
        document_id=document_id,
        request=request,
    )


@router.delete(
    "/{order_id}/documents/{document_id}",
)
async def delete_document(
    order_id: UUID,
    document_id: UUID,
    db: Session = Depends(get_db),
):
    service = UploadService(db)

    return await service.delete_document(
        order_id=order_id,
        document_id=document_id,
    )


@router.post(
    "/{order_id}/submit-staff-order",
)
def submit_staff_order(
    order_id: UUID,
    current_user=Depends(get_current_student),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    return service.submit_staff_order(
        order_id=order_id,
        user_id=current_user,
    )