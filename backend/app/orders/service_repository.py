from sqlalchemy.orm import Session

from app.models.service import Service


class ServiceRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_name(self, name: str):
        return (
            self.db.query(Service)
            .filter(
                Service.name == name,
                Service.is_active == True,
            )
            .first()
        )

    def get_all_active(self):
        return (
            self.db.query(Service)
            .filter(Service.is_active == True)
            .order_by(Service.display_order)
            .all()
        )