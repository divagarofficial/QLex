from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class PricingResponse(BaseModel):

    id: UUID

    paper_size: str

    print_type: str

    print_side: str

    shop_price: Decimal

    convenience_fee: Decimal

    is_active: bool

    class Config:

        from_attributes = True

class UpdatePricingRequest(BaseModel):

    shop_price: Decimal

    convenience_fee: Decimal | None = None

    is_active: bool

class ServiceResponse(BaseModel):

    id: UUID

    name: str

    description: str | None

    price: Decimal

    display_order: int

    is_active: bool

    class Config:

        from_attributes = True

class UpdateServiceRequest(BaseModel):

    description: str | None

    price: Decimal

    display_order: int

    is_active: bool


class PlatformFeesResponse(BaseModel):

    platform_fee: Decimal

    priority_fee: Decimal


