import pytest
from datetime import datetime, timedelta, date
from app.utils.estimated_time import calculate_order_estimated_time
from app.enums.order_status import OrderStatus

class DummyOrder:
    def __init__(self, id, created_at, status=OrderStatus.PAID, is_priority=False, shop_name="QLex Central Print Hub", documents=None):
        self.id = id
        self.created_at = created_at
        self.updated_at = created_at
        self.status = status
        self.is_priority = is_priority
        self.shop_name = shop_name
        self.documents = documents or []
        self.shop_queue = None

class DummyQuery:
    def __init__(self, items):
        self.items = items
    def filter(self, *args, **kwargs):
        return self
    def join(self, *args, **kwargs):
        return self
    def order_by(self, *args, **kwargs):
        return self
    def first(self):
        return self.items[0] if self.items else None
    def all(self):
        return self.items

class DummySession:
    def __init__(self, queues=None):
        self.queues = queues or []
    def query(self, model):
        return DummyQuery(self.queues)

def test_yesterday_active_order_estimated_time():
    yesterday = datetime.utcnow() - timedelta(days=1)
    order = DummyOrder(id="order-123", created_at=yesterday, status=OrderStatus.PAID)
    db = DummySession()

    res = calculate_order_estimated_time(db, order)

    assert res["estimated_wait_minutes"] == 0
    assert res["estimated_completion_time"] is None

def test_today_active_order_estimated_time():
    now = datetime.utcnow()
    order = DummyOrder(id="order-789", created_at=now, status=OrderStatus.PAID)
    db = DummySession()

    res = calculate_order_estimated_time(db, order)

    assert res["estimated_wait_minutes"] >= 1
    assert res["estimated_completion_time"] is not None

def test_completed_order_estimated_time():
    yesterday = datetime.utcnow() - timedelta(days=1)
    order = DummyOrder(id="order-456", created_at=yesterday, status=OrderStatus.COMPLETED)
    db = DummySession()

    res = calculate_order_estimated_time(db, order)

    assert res["estimated_wait_minutes"] == 0
    assert res["estimated_completion_time"] is None
