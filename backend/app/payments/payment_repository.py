from uuid import UUID

from sqlalchemy.orm import Session

from app.models.payment import Payment


class PaymentRepository:

    def __init__(
        self,
        db: Session,
    ):

        self.db = db


    def create(
        self,
        payment: Payment,
    ) -> Payment:

        self.db.add(payment)

        self.db.commit()

        self.db.refresh(payment)

        return payment


    def get_by_id(
        self,
        payment_id: UUID,
    ) -> Payment | None:

        return (
            self.db.query(Payment)
            .filter(
                Payment.id == payment_id,
                Payment.deleted_at.is_(None),
            )
            .first()
        )


    def get_by_gateway_order_id(
        self,
        gateway_order_id: str,
    ) -> Payment | None:

        return (
            self.db.query(Payment)
            .filter(
                Payment.gateway_order_id
                == gateway_order_id,

                Payment.deleted_at.is_(None),
            )
            .first()
        )


    def get_latest_for_order(
        self,
        order_id: UUID,
    ) -> Payment | None:

        return (
            self.db.query(Payment)
            .filter(
                Payment.order_id == order_id,
                Payment.deleted_at.is_(None),
            )
            .order_by(
                Payment.created_at.desc()
            )
            .first()
        )
    
    def get_by_gateway_order_id(
    self,
    gateway_order_id: str,
):

        return (
            self.db.query(Payment)
            .filter(
                Payment.gateway_order_id == gateway_order_id
            )
            .first()
        )

    def save(self):

        self.db.commit()