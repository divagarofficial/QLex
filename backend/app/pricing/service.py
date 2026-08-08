from decimal import Decimal
from .repository import PricingRepository


class PricingService:

    def __init__(self, db):

        self.repository = PricingRepository(db)

    def get_all_pricing(self):

        return (
            self.repository
            .get_all_pricing()
        )

    def update_pricing(
    self,
    pricing_id,
    request,
):

        pricing = (
            self.repository
            .get_pricing(
                pricing_id
            )
        )

        if pricing is None:

            raise ValueError(
                "Pricing not found."
            )

        pricing.shop_price = (
            request.shop_price
        )

        pricing.convenience_fee = (
            request.convenience_fee
        )

        pricing.is_active = (
            request.is_active
        )

        self.repository.save()

        return pricing

    def get_all_services(
    self,
):

        return (
            self.repository
            .get_all_services()
        )
    
    def update_service(
    self,
    service_id,
    request,
):

        service = (
            self.repository
            .get_service(
                service_id
            )
        )

        if service is None:

            raise ValueError(
                "Service not found."
            )

        service.price = request.price

        service.description = (
            request.description
        )

        service.display_order = (
            request.display_order
        )

        service.is_active = (
            request.is_active
        )

        self.repository.save()

        return service

    def get_platform_fees(self):
        from app.models.platform_setting import PlatformSetting
        from decimal import Decimal

        settings = self.repository.db.query(PlatformSetting).first()
        if not settings:
            return {"platform_fee": Decimal("0.00"), "priority_fee": Decimal("0.00")}

        return {
            "platform_fee": settings.platform_fee,
            "priority_fee": settings.priority_fee,
        }