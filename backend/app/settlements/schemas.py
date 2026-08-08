from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.enums.settlement_status import SettlementStatus


class SettlementResponse(BaseModel):

    id: UUID

    settlement_date: date

    amount: Decimal

    status: SettlementStatus

    generated_at: datetime

    paid_at: datetime | None = None

    upi_reference: str | None = None

    notes: str | None = None

    orders_count: int | None = None
    gross_sales: Decimal | None = None
    printing_revenue: Decimal | None = None
    platform_fee_deduction: Decimal | None = None
    convenience_fee_deduction: Decimal | None = None
    priority_fee_deduction: Decimal | None = None
    tax: Decimal | None = Decimal("0.00")
    net_settlement_amount: Decimal | None = None

    class Config:
        from_attributes = True


class UpiPaymentResponse(BaseModel):

    upi_id: str

    payee_name: str

    amount: Decimal

    reference: str