from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.enums.payment_status import PaymentStatus
from app.enums.settlement_status import SettlementStatus
from app.models.order import Order
from app.models.settlement import Settlement


class SettlementRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def sync_settlements(self, shop_id: str):
        """
        Ensures daily settlements exist for every date with paid orders:
          - If no settlement exists for a date, creates a PENDING settlement with amount = sum(Order.subtotal).
          - If a PENDING settlement exists for that date, updates its amount to equal sum(Order.subtotal).
          - If a COMPLETED settlement exists for that date, leaves it untouched.
        """
        rows = (
            self.db.query(func.date(Order.created_at).label("order_date"))
            .filter(Order.payment_status == PaymentStatus.PAID)
            .group_by(func.date(Order.created_at))
            .all()
        )

        for row in rows:
            target_date = row.order_date
            if isinstance(target_date, str):
                target_date = date.fromisoformat(target_date)
            elif hasattr(target_date, "date"):
                target_date = target_date.date()

            amount = (
                self.db.query(
                    func.coalesce(func.sum(Order.subtotal), Decimal("0.00"))
                )
                .filter(
                    func.date(Order.created_at) == target_date,
                    Order.payment_status == PaymentStatus.PAID,
                )
                .scalar()
            ) or Decimal("0.00")

            existing_list = (
                self.db.query(Settlement)
                .filter(
                    Settlement.settlement_date == target_date,
                )
                .order_by(Settlement.created_at.asc())
                .all()
            )

            if not existing_list:
                if amount > Decimal("0.00"):
                    settlement = Settlement(
                        shop_id=shop_id,
                        settlement_date=target_date,
                        amount=amount,
                        status=SettlementStatus.PENDING,
                        generated_at=datetime.now(),
                    )
                    self.db.add(settlement)
                    self.db.flush()
                    self.db.query(Order).filter(
                        func.date(Order.created_at) == target_date,
                        Order.payment_status == PaymentStatus.PAID,
                    ).update({"settlement_id": settlement.id}, synchronize_session=False)
            else:
                primary = existing_list[0]
                if primary.status == SettlementStatus.PENDING:
                    primary.amount = amount

                # Remove any duplicate pending settlement records for this date
                if len(existing_list) > 1:
                    for dup in existing_list[1:]:
                        if dup.status == SettlementStatus.PENDING:
                            self.db.delete(dup)

                self.db.query(Order).filter(
                    func.date(Order.created_at) == target_date,
                    Order.payment_status == PaymentStatus.PAID,
                ).update({"settlement_id": primary.id}, synchronize_session=False)

        # Recalculate amount for ALL pending settlements based strictly on orders created on that settlement date
        all_pending = (
            self.db.query(Settlement)
            .filter(Settlement.status == SettlementStatus.PENDING)
            .all()
        )
        for s in all_pending:
            correct_amount = (
                self.db.query(
                    func.coalesce(func.sum(Order.subtotal), Decimal("0.00"))
                )
                .filter(
                    func.date(Order.created_at) == s.settlement_date,
                    Order.payment_status == PaymentStatus.PAID,
                )
                .scalar()
            ) or Decimal("0.00")
            s.amount = correct_amount

        # Auto-correct any historical completed settlement where paid_at was stored in UTC instead of IST
        from datetime import timedelta
        completed = (
            self.db.query(Settlement)
            .filter(Settlement.status == SettlementStatus.COMPLETED)
            .all()
        )
        for s in completed:
            if s.paid_at and s.paid_at.hour < 5:
                s.paid_at = s.paid_at + timedelta(hours=5, minutes=30)

        # Migrate any legacy SHOP-001 shop_id records to RIT_PRINT_SHOP
        self.db.query(Settlement).filter(Settlement.shop_id == "SHOP-001").update(
            {"shop_id": "RIT_PRINT_SHOP"}, synchronize_session=False
        )

        self.db.commit()

    def attach_breakdown(self, settlement: Settlement):
        if not settlement:
            return settlement

        result = (
            self.db.query(
                func.count(Order.id).label("orders_count"),
                func.coalesce(func.sum(Order.grand_total), Decimal("0.00")).label("gross_sales"),
                func.coalesce(func.sum(Order.subtotal), Decimal("0.00")).label("printing_revenue"),
                func.coalesce(func.sum(Order.platform_fee), Decimal("0.00")).label("platform_fee"),
                func.coalesce(func.sum(Order.convenience_fee), Decimal("0.00")).label("convenience_fee"),
                func.coalesce(func.sum(Order.priority_fee), Decimal("0.00")).label("priority_fee"),
            )
            .filter(
                func.date(Order.created_at) == settlement.settlement_date,
                Order.payment_status == PaymentStatus.PAID,
            )
            .first()
        )

        settlement.orders_count = result[0] if result else 0
        settlement.gross_sales = result[1] if result else Decimal("0.00")
        settlement.printing_revenue = result[2] if result else Decimal("0.00")
        settlement.platform_fee_deduction = result[3] if result else Decimal("0.00")
        settlement.convenience_fee_deduction = result[4] if result else Decimal("0.00")
        settlement.priority_fee_deduction = result[5] if result else Decimal("0.00")
        settlement.tax = Decimal("0.00")
        settlement.net_settlement_amount = settlement.amount
        return settlement

    def get_existing_settlement(
        self,
        shop_id: str,
        settlement_date: date,
    ):
        settlement = (
            self.db.query(Settlement)
            .filter(
                Settlement.shop_id == shop_id,
                Settlement.settlement_date == settlement_date,
            )
            .first()
        )
        return self.attach_breakdown(settlement)

    def calculate_today_amount(
        self,
        settlement_date: date,
    ):
        return (
            self.db.query(
                func.coalesce(
                    func.sum(Order.subtotal),
                    Decimal("0.00"),
                )
            )
            .filter(
                func.date(Order.created_at) == settlement_date,
                Order.payment_status == PaymentStatus.PAID,
            )
            .scalar()
        )

    def create(
        self,
        settlement: Settlement,
    ):
        self.db.add(settlement)
        self.db.commit()
        self.db.refresh(settlement)
        return self.attach_breakdown(settlement)

    def get_pending(self):
        settlements = (
            self.db.query(Settlement)
            .filter(Settlement.status == SettlementStatus.PENDING)
            .order_by(Settlement.settlement_date.desc())
            .all()
        )
        return [self.attach_breakdown(s) for s in settlements]

    def get_history(self):
        settlements = (
            self.db.query(Settlement)
            .filter(Settlement.status == SettlementStatus.COMPLETED)
            .order_by(Settlement.paid_at.desc())
            .all()
        )
        return [self.attach_breakdown(s) for s in settlements]

    def get_by_id(
        self,
        settlement_id,
    ):
        settlement = (
            self.db.query(Settlement)
            .filter(Settlement.id == settlement_id)
            .first()
        )
        return self.attach_breakdown(settlement)

    def save(self):
        self.db.commit()