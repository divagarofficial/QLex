from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.enums.order_status import OrderStatus
from app.enums.paper_size import PaperSize
from app.enums.print_side import PrintSide
from app.enums.print_type import PrintType


class ShopOrderResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID

    status: OrderStatus

    payment_status: str | None = None

    token: str | None = None

    queue_state: str | None = None

    grand_total: Decimal

    is_priority: bool

    created_at: datetime

class TodayOrderResponse(BaseModel):

    token: str

    order_id: UUID

    student_id: UUID

    documents: int

    is_priority: bool

    queue_state: str

    is_current: bool = False

class RejectOrderRequest(BaseModel):

    reason: str | None = None


class ShopDocumentServiceResponse(BaseModel):

    id: UUID

    name: str

    quantity: int

    price: Decimal

    total: Decimal


class ShopDocumentResponse(BaseModel):

    id: UUID

    original_filename: str

    stored_filename: str | None = None

    url: str | None = None

    page_count: int

    copies: int

    print_type: PrintType

    paper_size: PaperSize

    print_side: PrintSide

    document_total: Decimal

    services: list[ShopDocumentServiceResponse]


class ShopOrderDetailsResponse(BaseModel):

    order_id: UUID

    student_id: UUID

    token: str

    status: str | None = None

    queue_state: str | None = None

    payment_status: str | None = None

    is_priority: bool

    grand_total: Decimal

    documents: list[ShopDocumentResponse]

class QueueStateResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    order_id: UUID

    token: str

    queue_state: str

    is_current: bool

class TodayRevenueResponse(
    BaseModel
):

    total_orders: int

    total_revenue: Decimal