from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.enums.payment_status import PaymentStatus
from app.enums.settlement_status import SettlementStatus
from app.models.order import Order
from app.models.settlement import Settlement


CENTRAL_HUB_ALIASES = [
    "QLex Central Print Hub",
    "RIT Central Print Hub",
    "RIT_PRINT_SHOP",
    "rit",
    "central",
]


class SettlementRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def sync_settlements(self, target_shop_name: str | None = None):
        """
        Ensures daily settlements exist for every shop and date with paid orders:
          - Groups paid orders by date and shop_name.
          - Creates or updates a PENDING settlement for each shop for that date.
          - Leaves COMPLETED settlements untouched.
        """
        query = (
            self.db.query(
                func.date(Order.created_at).label("order_date"),
                Order.shop_name.label("shop_name"),
            )
            .filter(Order.payment_status == PaymentStatus.PAID)
            .group_by(func.date(Order.created_at), Order.shop_name)
        )
        if target_shop_name:
            if target_shop_name in CENTRAL_HUB_ALIASES or target_shop_name.lower() in [a.lower() for a in CENTRAL_HUB_ALIASES]:
                query = query.filter(
                    (Order.shop_name.in_(CENTRAL_HUB_ALIASES))
                    | (Order.shop_slug.in_(CENTRAL_HUB_ALIASES))
                )
            else:
                from app.models.shop_model import Shop
                shop = self.db.query(Shop).filter(
                    (Shop.name == target_shop_name) | (Shop.slug == target_shop_name) | (func.lower(Shop.name) == target_shop_name.lower()) | (func.lower(Shop.slug) == target_shop_name.lower())
                ).first()
                match_names = [target_shop_name]
                if shop:
                    match_names.extend([shop.name, shop.slug])
                query = query.filter(
                    (Order.shop_name.in_(match_names))
                    | (Order.shop_slug.in_(match_names))
                    | (func.lower(Order.shop_name) == target_shop_name.lower())
                )

        rows = query.all()

        for row in rows:
            target_date = row.order_date
            if isinstance(target_date, str):
                target_date = date.fromisoformat(target_date)
            elif hasattr(target_date, "date"):
                target_date = target_date.date()

            raw_shop_name = row.shop_name or "QLex Central Print Hub"
            if raw_shop_name in CENTRAL_HUB_ALIASES or raw_shop_name.lower() in [a.lower() for a in CENTRAL_HUB_ALIASES]:
                shop_name_for_row = "QLex Central Print Hub"
                order_filter_condition = (Order.shop_name.in_(CENTRAL_HUB_ALIASES)) | (Order.shop_slug.in_(CENTRAL_HUB_ALIASES))
                settlement_filter_condition = Settlement.shop_id.in_(CENTRAL_HUB_ALIASES)
            else:
                shop_name_for_row = raw_shop_name
                order_filter_condition = (Order.shop_name == shop_name_for_row) | (func.lower(Order.shop_name) == shop_name_for_row.lower())
                settlement_filter_condition = (Settlement.shop_id == shop_name_for_row) | (func.lower(Settlement.shop_id) == shop_name_for_row.lower())

            amount = (
                self.db.query(
                    func.coalesce(func.sum(Order.subtotal), Decimal("0.00"))
                )
                .filter(
                    func.date(Order.created_at) == target_date,
                    Order.payment_status == PaymentStatus.PAID,
                    order_filter_condition,
                )
                .scalar()
            ) or Decimal("0.00")

            existing_list = (
                self.db.query(Settlement)
                .filter(
                    Settlement.settlement_date == target_date,
                    settlement_filter_condition,
                )
                .order_by(Settlement.created_at.asc())
                .all()
            )

            if not existing_list:
                if amount > Decimal("0.00"):
                    settlement = Settlement(
                        shop_id=shop_name_for_row,
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
                        order_filter_condition,
                    ).update({"settlement_id": settlement.id}, synchronize_session=False)
            else:
                primary = existing_list[0]
                if primary.status == SettlementStatus.PENDING:
                    primary.amount = amount

                if len(existing_list) > 1:
                    for dup in existing_list[1:]:
                        if dup.status == SettlementStatus.PENDING:
                            self.db.delete(dup)

                self.db.query(Order).filter(
                    func.date(Order.created_at) == target_date,
                    Order.payment_status == PaymentStatus.PAID,
                    order_filter_condition,
                ).update({"settlement_id": primary.id}, synchronize_session=False)

        # Deduplicate and clean up PENDING settlements per shop & date
        all_pending = self.db.query(Settlement).filter(Settlement.status == SettlementStatus.PENDING).all()
        pending_by_group = {}
        for s in all_pending:
            if s.shop_id in CENTRAL_HUB_ALIASES or (s.shop_id and s.shop_id.lower() in [a.lower() for a in CENTRAL_HUB_ALIASES]):
                group_key = ("QLex Central Print Hub", s.settlement_date)
            else:
                group_key = (s.shop_id, s.settlement_date)
            
            if group_key not in pending_by_group:
                pending_by_group[group_key] = []
            pending_by_group[group_key].append(s)

        for (norm_shop, target_date), s_list in pending_by_group.items():
            if norm_shop == "QLex Central Print Hub":
                order_cond = (Order.shop_name.in_(CENTRAL_HUB_ALIASES)) | (Order.shop_slug.in_(CENTRAL_HUB_ALIASES))
            else:
                order_cond = (Order.shop_name == norm_shop) | (func.lower(Order.shop_name) == norm_shop.lower())

            real_amount = (
                self.db.query(func.coalesce(func.sum(Order.subtotal), Decimal("0.00")))
                .filter(
                    func.date(Order.created_at) == target_date,
                    Order.payment_status == PaymentStatus.PAID,
                    order_cond,
                )
                .scalar()
            ) or Decimal("0.00")

            primary = s_list[0]
            if norm_shop == "QLex Central Print Hub":
                primary.shop_id = "QLex Central Print Hub"
            primary.amount = real_amount

            if len(s_list) > 1:
                for dup in s_list[1:]:
                    self.db.delete(dup)

            if real_amount == Decimal("0.00"):
                self.db.delete(primary)

        # Migrate legacy SHOP-001 shop_id records to RIT_PRINT_SHOP
        self.db.query(Settlement).filter(Settlement.shop_id == "SHOP-001").update(
            {"shop_id": "RIT_PRINT_SHOP"}, synchronize_session=False
        )

        self.db.commit()

    def attach_breakdown(self, settlement: Settlement):
        if not settlement:
            return settlement

        s_id = getattr(settlement, "shop_id", None)
        is_central = False
        if s_id and (s_id in CENTRAL_HUB_ALIASES or s_id.lower() in [a.lower() for a in CENTRAL_HUB_ALIASES]):
            is_central = True

        query = (
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
        )
        if is_central:
            query = query.filter(
                (Order.shop_name.in_(CENTRAL_HUB_ALIASES))
                | (Order.shop_slug.in_(CENTRAL_HUB_ALIASES))
            )
            settlement.shop_name = "QLex Central Print Hub"
        elif s_id:
            query = query.filter(
                (Order.shop_name == s_id)
                | (Order.shop_slug == s_id)
                | (func.lower(Order.shop_name) == s_id.lower())
                | (func.lower(Order.shop_slug) == s_id.lower())
            )
            from app.models.shop_model import Shop
            shop_obj = self.db.query(Shop).filter(
                (Shop.name == s_id) | (Shop.slug == s_id) | (func.lower(Shop.name) == s_id.lower()) | (func.lower(Shop.slug) == s_id.lower())
            ).first()
            if shop_obj:
                settlement.shop_name = shop_obj.name
            else:
                settlement.shop_name = s_id
        else:
            query = query.filter(
                (Order.shop_name.in_(CENTRAL_HUB_ALIASES))
                | (Order.shop_slug.in_(CENTRAL_HUB_ALIASES))
            )
            settlement.shop_id = "RIT_PRINT_SHOP"
            settlement.shop_name = "QLex Central Print Hub"

        result = query.first()

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

    def get_pending(self, shop_name: str | None = None):
        query = self.db.query(Settlement).filter(Settlement.status == SettlementStatus.PENDING)
        if shop_name:
            if shop_name in CENTRAL_HUB_ALIASES or shop_name.lower() in [a.lower() for a in CENTRAL_HUB_ALIASES]:
                query = query.filter(Settlement.shop_id.in_(CENTRAL_HUB_ALIASES))
            else:
                from app.models.shop_model import Shop
                shop = self.db.query(Shop).filter(
                    (func.lower(Shop.name) == shop_name.lower()) | (func.lower(Shop.slug) == shop_name.lower())
                ).first()
                match_ids = [shop_name]
                if shop:
                    match_ids.extend([shop.name, shop.slug])
                query = query.filter(
                    (Settlement.shop_id.in_(match_ids))
                    | (func.lower(Settlement.shop_id) == shop_name.lower())
                )
        else:
            query = query.filter(Settlement.shop_id.in_(CENTRAL_HUB_ALIASES))

        settlements = query.order_by(Settlement.settlement_date.desc()).all()
        return [self.attach_breakdown(s) for s in settlements]

    def get_history(self, shop_name: str | None = None):
        query = self.db.query(Settlement).filter(Settlement.status == SettlementStatus.COMPLETED)
        if shop_name:
            if shop_name in CENTRAL_HUB_ALIASES or shop_name.lower() in [a.lower() for a in CENTRAL_HUB_ALIASES]:
                query = query.filter(Settlement.shop_id.in_(CENTRAL_HUB_ALIASES))
            else:
                from app.models.shop_model import Shop
                shop = self.db.query(Shop).filter(
                    (func.lower(Shop.name) == shop_name.lower()) | (func.lower(Shop.slug) == shop_name.lower())
                ).first()
                match_ids = [shop_name]
                if shop:
                    match_ids.extend([shop.name, shop.slug])
                query = query.filter(
                    (Settlement.shop_id.in_(match_ids))
                    | (func.lower(Settlement.shop_id) == shop_name.lower())
                )
        else:
            query = query.filter(Settlement.shop_id.in_(CENTRAL_HUB_ALIASES))

        settlements = query.order_by(Settlement.paid_at.desc()).all()
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