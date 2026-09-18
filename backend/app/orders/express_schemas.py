from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field


class PublicShopResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    tagline: str | None = None
    description: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    is_express_enabled: bool = False
    requires_account: bool = True
    operating_hours: str | None = None

    class Config:
        from_attributes = True


class ShopRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Shop business name")
    slug: str | None = Field(default=None, max_length=100, description="Unique URL slug (optional, auto-generated if blank)")
    tagline: str | None = Field(default=None, max_length=200, description="Short shop tagline")
    description: str | None = Field(default=None, description="Detailed shop description")
    address: str | None = Field(default=None, description="Full shop address")
    phone: str | None = Field(default=None, max_length=20, description="Contact phone number")
    email: str | None = Field(default=None, max_length=255, description="Contact email address")
    upi_id: str | None = Field(default=None, max_length=100, description="UPI VPA ID for receiving payments")
    operating_hours: str | None = Field(default="8:00 AM - 8:00 PM", max_length=100, description="Daily operating hours")
    is_express_enabled: bool = Field(default=True, description="Enable express walk-in orders")
    requires_account: bool = Field(default=False, description="Require customer student/staff account login")
    pin: str | None = Field(default="0810", description="4-digit operator access PIN")




class CreateExpressDraftRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, description="10-digit customer mobile number")
    full_name: str | None = Field(default=None, max_length=100, description="Customer full name")
    shop_slug: str = Field(default="acme", description="Target shop slug e.g. acme")
    is_priority: bool = Field(default=False, description="Express rush priority")


class ExpressDraftResponse(BaseModel):
    order_id: UUID
    shop_name: str
    shop_slug: str
    guest_phone: str
    guest_name: str | None = None
    status: str
    created_at: datetime


class ExpressOrderStatusResponse(BaseModel):
    order_id: UUID
    token_number: str | None = None
    queue_state: str | None = None
    status: str
    payment_status: str
    shop_name: str
    shop_slug: str | None = None
    shop_address: str | None = None
    shop_phone: str | None = None
    estimated_wait_minutes: int | None = None
    guest_phone: str | None = None
    guest_name: str | None = None
    grand_total: Decimal = Decimal("0.00")
    documents_count: int = 0
    total_pages: int = 0
    created_at: datetime
