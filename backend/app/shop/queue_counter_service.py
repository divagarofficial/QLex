from datetime import date

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.enums.queue_type import QueueType
from app.models.daily_queue_counter import DailyQueueCounter


class QueueCounterService:

    def __init__(self, db: Session):

        self.db = db

    def next_number(
        self,
        queue_type: QueueType,
    ) -> int:

        counter = (
            self.db.execute(
                select(DailyQueueCounter)
                .where(
                    DailyQueueCounter.queue_date == date.today()
                )
                .with_for_update()
            )
            .scalar_one_or_none()
        )

        if counter is None:

            counter = DailyQueueCounter(
                queue_date=date.today(),
                priority_last=0,
                regular_last=0,
            )

            self.db.add(counter)

            self.db.flush()

        if queue_type == QueueType.PRIORITY:

            counter.priority_last += 1

            number = counter.priority_last

        else:

            counter.regular_last += 1

            number = counter.regular_last

        self.db.flush()

        return number