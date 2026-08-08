from sqlalchemy.orm import Session

from app.models.pricing import Pricing


class PricingRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_pricing(
        self,
        paper_size,
        print_type,
        print_side,
    ):
        return (
            self.db.query(Pricing)
            .filter(
                Pricing.paper_size == paper_size,
                Pricing.print_type == print_type,
                Pricing.print_side == print_side,
                Pricing.is_active == True,
            )
            .first()
        )