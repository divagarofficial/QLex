from decimal import Decimal

from sqlalchemy.orm import Session

from app.orders.pricing_repository import PricingRepository
from app.orders.service_repository import ServiceRepository


class PricingService:

    def __init__(self, db: Session):

        self.db = db

        self.pricing_repository = PricingRepository(db)

        self.service_repository = ServiceRepository(db)


    def get_print_price(
        self,
        paper_size,
        print_type,
        print_side,
    ):

        return self.pricing_repository.get_pricing(
            paper_size=paper_size,
            print_type=print_type,
            print_side=print_side,
        )


    def get_service_price(
        self,
        service_name: str,
    ) -> Decimal:

        service = (
            self.service_repository
            .get_by_name(service_name)
        )

        if service is None:

            return Decimal("0.00")

        return Decimal(service.price)


    def calculate_document_total(
        self,
        page_count: int,
        copies: int,
        paper_size,
        print_type,
        print_side,
        spiral_binding: bool = False,
        soft_binding: bool = False,
    ) -> Decimal:

        pricing = self.get_print_price(
            paper_size=paper_size,
            print_type=print_type,
            print_side=print_side,
        )

        if pricing is None:

            raise ValueError(
                "Pricing is not configured "
                "for the selected print options."
            )

        # Shop printing cost only

        print_cost = (
            Decimal(page_count)
            * Decimal(copies)
            * Decimal(pricing.shop_price)
        )

        # Selected binding service costs

        service_cost = Decimal("0.00")

        if spiral_binding:

            service_cost += (
                self.get_service_price(
                    "Spiral Binding"
                )
            )

        if soft_binding:

            service_cost += (
                self.get_service_price(
                    "Soft Binding"
                )
            )

        # Convenience fee is NOT included here.
        # It is stored separately at order level.

        document_total = (
            print_cost
            + service_cost
        )

        return document_total.quantize(
            Decimal("0.01")
        )


    def calculate_document_convenience_fee(
        self,
        page_count: int,
        copies: int,
        paper_size,
        print_type,
        print_side,
    ) -> Decimal:

        pricing = self.get_print_price(
            paper_size=paper_size,
            print_type=print_type,
            print_side=print_side,
        )

        if pricing is None:

            raise ValueError(
                "Pricing is not configured "
                "for the selected print options."
            )

        convenience_fee = (
            Decimal(page_count)
            * Decimal(copies)
            * Decimal(pricing.convenience_fee)
        )

        return convenience_fee.quantize(
            Decimal("0.01")
        )