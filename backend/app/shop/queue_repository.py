from datetime import date

from sqlalchemy.orm import Session

from app.enums.queue_state import QueueState
from app.models.shop_queue import ShopQueue


class ShopQueueRepository:

    def __init__(self, db: Session):

        self.db = db

    def get_today_priority_count(self):

        return (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.token.like("P-%"),
            )
            .count()
        )

    def get_today_regular_count(self):

        return (
            self.db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.token.like("R-%"),
            )
            .count()
        )

    def create(
        self,
        queue: ShopQueue,
    ):

        self.db.add(queue)
        self.db.flush()
        self.db.refresh(queue)
        return queue

    def save(self):

        self.db.commit()