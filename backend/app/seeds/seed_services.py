from decimal import Decimal

from sqlalchemy.orm import Session

from app.enums.service_pricing_type import ServicePricingType
from app.models.service import Service


def seed_services(db: Session):

    services = [
        {
            "name": "Spiral Binding",
            "description": "Spiral Binding Service",
            "price":Decimal("30.00"),
            "pricing_type": ServicePricingType.FIXED,
            "display_order": 1,
            "is_active": True,
        },
        {
            "name": "Soft Binding",
            "description": "Soft Binding Service",
            "price": Decimal("20.00"),
            "pricing_type": ServicePricingType.FIXED,
            "display_order": 2,
            "is_active": True,
        },
    ]

    for service in services:

        exists = (
            db.query(Service)
            .filter(Service.name == service["name"])
            .first()
        )

        if not exists:
            db.add(Service(**service))

    db.commit()