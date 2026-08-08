from pydantic import BaseModel
from typing import List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from app.models.order import Order




class MyTokenResponse(BaseModel):

    token: str

    status: str

    estimated_wait_minutes: int

    is_priority: bool

    order_id: str | None = None

    queue_number: int | None = None

    students_ahead: int | None = 0

    currently_printing: str | None = None

    created_at: str | None = None

class LiveQueueResponse(BaseModel):

    currently_printing: str | None

    priority_queue: List[str]

    regular_queue: List[str]

class MyOrderItem(BaseModel):

    order_id: UUID

    token: str | None

    status: str

    payment_status: str

    total_amount: Decimal

    documents: int

    created_at: datetime

    is_priority: bool = False


class MyOrdersResponse(BaseModel):

    orders: list[MyOrderItem]


class OrderDocumentResponse(BaseModel):

    id: UUID

    file_name: str

    copies: int

    page_count: int

    paper_size: str

    print_type: str

    print_side: str

    document_total: Decimal


class OrderDetailsResponse(BaseModel):

    order_id: UUID

    token: str | None

    status: str

    payment_status: str

    total_amount: Decimal

    subtotal: Decimal | None = None

    convenience_fee: Decimal | None = None

    platform_fee: Decimal | None = None

    priority_fee: Decimal | None = None

    is_priority: bool

    created_at: datetime

    documents: list[OrderDocumentResponse]
    
class PaymentItemResponse(BaseModel):

    payment_id: UUID

    order_id: UUID

    token: str | None

    amount: Decimal

    status: str

    paid_at: datetime | None


class PaymentsResponse(BaseModel):

    payments: list[PaymentItemResponse]