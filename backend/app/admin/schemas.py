from decimal import Decimal

from pydantic import BaseModel
from datetime import date
from typing import Optional
from datetime import date, datetime
from uuid import UUID




class DashboardResponse(BaseModel):

    today_orders: int

    today_revenue: Decimal

    waiting_orders: int

    printing_orders: int

    ready_orders: int

    served_orders: int

    waiting_room_students: int

    active_sessions: int

    server_status: str

class TodayRevenueResponse(BaseModel):

    date: date

    total_orders: int

    convenience_fee: Decimal = Decimal("0.00")

    platform_fee: Decimal

    priority_fee: Decimal

    total_revenue: Decimal

class MonthlyRevenueResponse(BaseModel):

    month: str

    total_orders: int

    convenience_fee: Decimal = Decimal("0.00")

    platform_fee: Decimal

    priority_fee: Decimal

    total_revenue: Decimal

class RevenueHistoryItem(BaseModel):

    date: date

    total_orders: int

    convenience_fee: Decimal = Decimal("0.00")

    platform_fee: Decimal

    priority_fee: Decimal

    total_revenue: Decimal



class RevenueHistoryResponse(BaseModel):

    history: list[RevenueHistoryItem]

class PlatformSettingsResponse(BaseModel):

    platform_fee: Decimal

    priority_fee: Decimal

    max_documents_per_order: int

    max_upload_size_mb: int

    max_pages_per_document: int

    draft_expiry_hours: int

    queue_timeout_minutes: int

    allow_new_orders: bool

    maintenance_mode: bool
    allow_first_year_personal_email: bool = True

    general: Optional[dict] = None

    platform: Optional[dict] = None

    orders: Optional[dict] = None

    notifications: Optional[dict] = None

    security: Optional[dict] = None

    integrations: Optional[list] = None

    appearance: Optional[dict] = None

    advanced: Optional[dict] = None

    about: Optional[dict] = None

    extra_settings: Optional[dict] = None


class UpdatePlatformSettingsRequest(BaseModel):

    platform_fee: Optional[Decimal] = None

    priority_fee: Optional[Decimal] = None

    max_documents_per_order: Optional[int] = None

    max_upload_size_mb: Optional[int] = None

    max_pages_per_document: Optional[int] = None

    draft_expiry_hours: Optional[int] = None

    queue_timeout_minutes: Optional[int] = None

    allow_new_orders: Optional[bool] = None

    maintenance_mode: Optional[bool] = None

    allow_first_year_personal_email: Optional[bool] = None


    general: Optional[dict] = None

    platform: Optional[dict] = None

    orders: Optional[dict] = None

    notifications: Optional[dict] = None

    security: Optional[dict] = None

    integrations: Optional[list] = None

    appearance: Optional[dict] = None

    advanced: Optional[dict] = None

    about: Optional[dict] = None

    extra_settings: Optional[dict] = None


class TestIntegrationRequest(BaseModel):

    id: str


class TestIntegrationResponse(BaseModel):

    id: str

    success: bool

    message: str

    timestamp: datetime


class SettlementResponse(BaseModel):

    id: UUID

    settlement_date: date

    amount: Decimal

    status: str

    generated_at: datetime

    paid_at: Optional[datetime] = None

    upi_reference: Optional[str] = None

    notes: Optional[str] = None

    orders_count: Optional[int] = None
    gross_sales: Optional[Decimal] = None
    printing_revenue: Optional[Decimal] = None
    platform_fee_deduction: Optional[Decimal] = None
    convenience_fee_deduction: Optional[Decimal] = None
    priority_fee_deduction: Optional[Decimal] = None
    tax: Optional[Decimal] = Decimal("0.00")
    net_settlement_amount: Optional[Decimal] = None

    shop_id: Optional[str] = "RIT_PRINT_SHOP"
    shop_name: Optional[str] = "QLex Central Print Hub"
    owner_name: Optional[str] = "RIT Central Admin"
    bank_name: Optional[str] = "HDFC Bank Ltd."
    account_number: Optional[str] = "XXXX-XXXX-4821"
    settlement_cycle: Optional[str] = "Daily"


class SettlementListResponse(BaseModel):

    settlements: list[SettlementResponse]


class CompleteSettlementRequest(BaseModel):

    upi_reference: str

    notes: Optional[str] = None


class QueueMonitorItem(BaseModel):

    order_id: UUID

    token: str

    queue_number: int

    queue_type: str

    status: str

    is_current: bool


class QueueMonitorResponse(BaseModel):

    orders: list[QueueMonitorItem]

class ServerHealthResponse(BaseModel):

    status: str

    database: str

    timestamp: datetime


class OverviewResponse(BaseModel):
    total_students: int
    registered_shops: int
    today_orders: int
    active_orders: int
    completed_orders_today: int
    platform_revenue_today: Decimal
    platform_revenue_month: Decimal
    pending_settlements_amount: Decimal
    pending_settlements_count: int


class RecentOrderItem(BaseModel):
    order_id: UUID
    register_number: str
    token: Optional[str] = None
    shop_name: str = "Central QLex Hub"
    status: str
    is_priority: bool
    grand_total: Decimal
    created_at: datetime


class RecentOrdersResponse(BaseModel):
    orders: list[RecentOrderItem]


class RecentPaymentItem(BaseModel):
    id: UUID
    transaction_id: str
    register_number: str
    amount: Decimal
    gateway: str
    status: str
    created_at: datetime


class RecentPaymentsResponse(BaseModel):
    payments: list[RecentPaymentItem]


class AdminShopItem(BaseModel):
    shop_id: str
    name: str
    status: str
    orders_today: int
    orders_waiting: int
    revenue_today: Decimal
    pending_settlement: Decimal
    health: str


class AdminShopsResponse(BaseModel):
    shops: list[AdminShopItem]


class AdminNotificationItem(BaseModel):
    id: str
    title: str
    message: str
    type: str
    created_at: datetime
    unread: bool


class AdminNotificationsResponse(BaseModel):
    notifications: list[AdminNotificationItem]


class StudentOverviewResponse(BaseModel):
    total_students: int
    active_students: int
    blocked_students: int
    new_registrations_today: int
    students_with_active_orders: int


class StudentItemResponse(BaseModel):
    id: UUID
    register_number: str
    full_name: str
    phone: str
    email: Optional[str] = None
    department_id: str
    department_name: str
    year_id: str
    year_number: int
    section_id: str
    section_name: str
    is_active: bool
    created_at: datetime
    total_orders: int
    completed_orders: int
    cancelled_orders: int
    total_spent: Decimal
    current_active_token: Optional[str] = None
    current_order_status: Optional[str] = None


class StudentsListResponse(BaseModel):
    students: list[StudentItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ToggleStudentStatusRequest(BaseModel):
    is_active: Optional[bool] = None


class AdminOrderItemFull(BaseModel):
    id: UUID
    order_id: UUID
    student_name: str
    register_number: str
    token: Optional[str] = None
    shop_name: str = "QLex Central Print Hub"
    status: str
    payment_status: str
    is_priority: bool
    amount: Decimal
    final_amount: Decimal
    grand_total: Decimal
    created_at: datetime


class AdminOrdersListResponse(BaseModel):
    orders: list[AdminOrderItemFull]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminPaymentItemFull(BaseModel):
    id: UUID
    transaction_id: str
    order_id: Optional[UUID] = None
    user_name: str
    register_number: str
    amount: Decimal
    gateway: str
    status: str
    created_at: datetime


class AdminPaymentsListResponse(BaseModel):
    payments: list[AdminPaymentItemFull]
    total: int
    page: int
    page_size: int
    total_pages: int

