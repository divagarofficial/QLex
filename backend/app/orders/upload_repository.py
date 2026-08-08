from sqlalchemy.orm import Session

from app.models.order_document import OrderDocument
from uuid import UUID

from app.models.order_document import OrderDocument


class UploadRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, document: OrderDocument):
        self.db.add(document)
        self.db.flush()
        return document

    def get_document(self, document_id):
        return (
            self.db.query(OrderDocument)
            .filter(OrderDocument.id == document_id)
            .first()
        )


    def commit(self):
        self.db.commit()


    def refresh(self, obj):
        self.db.refresh(obj)
    def save(self):

        self.db.commit()