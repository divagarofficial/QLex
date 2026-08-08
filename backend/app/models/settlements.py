from app.db.base import BaseModel
class Settlement(BaseModel):

    shop_id

    settlement_date

    amount

    status

    generated_at

    paid_at

    upi_reference

    notes