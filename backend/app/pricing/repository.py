from sqlalchemy.orm import Session

from app.models.pricing import Pricing
from app.models.service import Service


class PricingRepository:

    def __init__(self, db: Session):
        self.db = db

    # ---------- PRINT PRICING ----------

    def get_all_pricing(self):

        return (
            self.db.query(Pricing)
            .order_by(
                Pricing.paper_size,
                Pricing.print_type,
                Pricing.print_side,
            )
            .all()
        )

    def get_pricing(
        self,
        pricing_id,
    ):

        return (
            self.db.query(Pricing)
            .filter(
                Pricing.id == pricing_id
            )
            .first()
        )

    # ---------- SERVICES ----------

    def get_all_services(self):

        return (
            self.db.query(Service)
            .order_by(
                Service.display_order
            )
            .all()
        )

    def get_service(
        self,
        service_id,
    ):

        return (
            self.db.query(Service)
            .filter(
                Service.id == service_id
            )
            .first()
        )

    def save(self):

        self.db.commit()