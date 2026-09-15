from datetime import datetime, date
from uuid import UUID

from app.enums.settlement_status import SettlementStatus
from app.models.settlement import Settlement

from .repository import SettlementRepository

class SettlementService:

    SHOP_ID = "RIT_PRINT_SHOP"

    def __init__(
        self,
        db,
    ):
        self.repository = SettlementRepository(db)

    def generate_today_settlement(self):
        self.repository.sync_settlements(self.SHOP_ID)
        today = date.today()
        existing = self.repository.get_existing_settlement(
            self.SHOP_ID,
            today,
        )
        if existing:
            return existing

        amount = self.repository.calculate_today_amount(today)
        settlement = Settlement(
            shop_id=self.SHOP_ID,
            settlement_date=today,
            amount=amount,
            status=SettlementStatus.PENDING,
            generated_at=datetime.now(),
        )
        return self.repository.create(settlement)

    def get_pending_settlements(self, shop_name: str | None = None):
        self.repository.sync_settlements(target_shop_name=shop_name)
        return self.repository.get_pending(shop_name=shop_name)

    def get_settlement_history(self, shop_name: str | None = None):
        self.repository.sync_settlements(target_shop_name=shop_name)
        return self.repository.get_history(shop_name=shop_name)

    def get_settlement_by_id(self, settlement_id: UUID):
        self.repository.sync_settlements(self.SHOP_ID)
        settlement = self.repository.get_by_id(settlement_id)
        if settlement is None:
            raise ValueError("Settlement not found.")
        return settlement

    def generate_upi_payment(self, settlement_id: UUID):
        settlement = self.repository.get_by_id(settlement_id)
        if settlement is None:
            raise ValueError("Settlement not found.")

        return {
            "upi_id": "ritprint@okaxis",
            "payee_name": "RIT Print Shop",
            "amount": settlement.amount,
            "reference": f"QLX-{settlement.settlement_date:%Y%m%d}",
        }

    def complete_settlement(self, settlement_id: UUID):
        settlement = self.repository.get_by_id(settlement_id)
        if settlement is None:
            raise ValueError("Settlement not found.")

        settlement.status = SettlementStatus.COMPLETED
        settlement.paid_at = datetime.now()
        self.repository.save()

        return settlement