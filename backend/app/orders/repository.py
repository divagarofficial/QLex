from sqlalchemy.orm import Session

from app.models.order import Order
from uuid import UUID
from app.models.order import Order


from sqlalchemy.orm import selectinload
from app.models.order_document import OrderDocument
from app.models.order_document_service import OrderDocumentService


class OrderRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, order: Order):

        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)

        return order
    
    def get_by_id(self, order_id: UUID):

        return (
            self.db.query(Order)
            .filter(Order.id == order_id)
            .first()
        )


    def save(self):

        self.db.commit()

    def get_order_summary(
    self,
    order_id: UUID,
):

        return (
            self.db.query(Order)
            .options(
                selectinload(
                    Order.documents
                )
                .selectinload(
                    OrderDocument.document_services
                )
                .selectinload(
                    OrderDocumentService.service
                )
            )
            .filter(
                Order.id == order_id,
                Order.deleted_at.is_(None),
            )
            .first()
        )