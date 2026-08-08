from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from .schemas import (
    SettlementResponse,
    UpiPaymentResponse,
)
from .service import SettlementService

router = APIRouter(
    prefix="/settlements",
    tags=["Settlements"],
)

@router.post(
    "/generate",
    response_model=SettlementResponse,
)
def generate_today_settlement(
    db: Session = Depends(get_db),
):

    service = SettlementService(db)

    return service.generate_today_settlement()

@router.get(
    "/pending",
    response_model=list[SettlementResponse],
)
def pending_settlements(
    db: Session = Depends(get_db),
):

    service = SettlementService(db)

    return service.get_pending_settlements()

@router.get(
    "/history",
    response_model=list[SettlementResponse],
)
def settlement_history(
    db: Session = Depends(get_db),
):

    service = SettlementService(db)

    return service.get_settlement_history()

@router.get(
    "/{settlement_id}",
    response_model=SettlementResponse,
)
def get_settlement_by_id(
    settlement_id: UUID,
    db: Session = Depends(get_db),
):

    service = SettlementService(db)

    return service.get_settlement_by_id(settlement_id)

@router.post(
    "/{settlement_id}/generate-upi",
    response_model=UpiPaymentResponse,
)
def generate_upi(
    settlement_id: UUID,
    db: Session = Depends(get_db),
):

    service = SettlementService(db)

    return service.generate_upi_payment(
        settlement_id
    )

@router.post(
    "/{settlement_id}/complete",
    response_model=SettlementResponse,
)
def complete_settlement(
    settlement_id: UUID,
    db: Session = Depends(get_db),
):

    service = SettlementService(db)

    return service.complete_settlement(
        settlement_id
    )