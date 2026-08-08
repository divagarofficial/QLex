from uuid import UUID

from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.db.database import get_db

from .service import PricingService

from .schemas import (
    PricingResponse,
    UpdatePricingRequest,
    ServiceResponse,
    UpdateServiceRequest,
    PlatformFeesResponse,
)

router = APIRouter(

    prefix="/pricing",

    tags=["Pricing"],
)

@router.get(
    "/config",
    response_model=PlatformFeesResponse,
)
def get_platform_fees(
    db: Session = Depends(get_db),
):
    service = PricingService(db)
    return service.get_platform_fees()


@router.get(
    "",
    response_model=list[PricingResponse],
)
def get_pricing(

    db: Session = Depends(get_db),

):

    service = PricingService(db)

    return service.get_all_pricing()

@router.put(
    "/{pricing_id}",
    response_model=PricingResponse,
)
def update_pricing(

    pricing_id: UUID,

    request: UpdatePricingRequest,

    db: Session = Depends(get_db),

):

    service = PricingService(db)

    return service.update_pricing(

        pricing_id,

        request,
    )

@router.get(
    "/services",
    response_model=list[ServiceResponse],
)
def get_services(

    db: Session = Depends(get_db),

):

    service = PricingService(db)

    return service.get_all_services()

@router.put(
    "/services/{service_id}",
    response_model=ServiceResponse,
)
def update_service(

    service_id: UUID,

    request: UpdateServiceRequest,

    db: Session = Depends(get_db),

):

    service = PricingService(db)

    return service.update_service(

        service_id,

        request,
    )

