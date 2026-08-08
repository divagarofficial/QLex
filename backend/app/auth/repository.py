from sqlalchemy.orm import Session

from app.models.user import User


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_register_number(self, register_number: str):
        return (
            self.db.query(User)
            .filter(User.register_number == register_number)
            .first()
        )

    def get_by_phone(self, phone: str):
        return (
            self.db.query(User)
            .filter(User.phone == phone)
            .first()
        )

    def get_by_email(self, email: str):
        return (
            self.db.query(User)
            .filter(User.email == email)
            .first()
        )

    def create(self, user: User):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def authenticate(self, register_number: str):
        return (
            self.db.query(User)
            .filter(User.register_number == register_number)
            .first()
        )