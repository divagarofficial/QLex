from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.enums.order_status import OrderStatus
from app.enums.payment_status import PaymentStatus
from app.enums.paper_size import PaperSize
from app.enums.print_type import PrintType
from app.enums.print_side import PrintSide


# ==================================================
# CREATE DRAFT ORDER
# ==================================================

class CreateDraftOrderRequest(BaseModel):

    is_priority: bool = False


class ConfirmOrderRequest(BaseModel):

    is_priority: bool = False


class DraftOrderResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID

    status: OrderStatus

    payment_status: PaymentStatus

    subtotal: Decimal

    convenience_fee: Decimal

    platform_fee: Decimal

    priority_fee: Decimal

    grand_total: Decimal

    estimated_completion_time: datetime | None

    draft_expires_at: datetime | None


# ==================================================
# ORDER SUMMARY
# ==================================================

class OrderServiceSummary(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID

    name: str

    quantity: int

    price: Decimal

    total: Decimal


class OrderDocumentSummary(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID

    original_filename: str

    stored_filename: str | None = None

    page_count: int

    custom_pages: str | None = None

    printable_page_count: int = 1

    file_size: int = 0

    url: str | None = None

    paper_size: PaperSize

    print_type: PrintType

    print_side: PrintSide

    copies: int

    shop_price_per_page: Decimal

    document_total: Decimal

    services: list[OrderServiceSummary] = Field(
        default_factory=list
    )


class OrderSummaryResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID

    student_id: UUID

    status: OrderStatus

    payment_status: PaymentStatus

    is_priority: bool

    subtotal: Decimal

    convenience_fee: Decimal

    platform_fee: Decimal

    priority_fee: Decimal

    grand_total: Decimal

    estimated_completion_time: datetime | None

    draft_expires_at: datetime | None

    created_at: datetime

    documents: list[OrderDocumentSummary] = Field(
        default_factory=list
    )