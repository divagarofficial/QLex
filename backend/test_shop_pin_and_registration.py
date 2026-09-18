import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db, SessionLocal
from app.seeds.seed_shops import seed_shops

client = TestClient(app)

def setup_module(module):
    db = SessionLocal()
    try:
        seed_shops(db)
    finally:
        db.close()

def test_shop_login_default_pin():
    # Test RIT default PIN
    res = client.post("/api/v1/auth/shop-login", json={"pin": "0810", "shop_slug": "rit"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "token" in data

    # Test Acme default PIN
    res2 = client.post("/api/v1/auth/shop-login", json={"pin": "1234", "shop_slug": "acme"})
    assert res2.status_code == 200

def test_shop_login_invalid_pin():
    res = client.post("/api/v1/auth/shop-login", json={"pin": "0000", "shop_slug": "rit"})
    assert res.status_code == 401

    # Invalid PIN length
    res_bad = client.post("/api/v1/auth/shop-login", json={"pin": "12", "shop_slug": "rit"})
    assert res_bad.status_code == 400

def test_register_non_college_shop_with_pin():
    payload = {
        "name": "Test Kiosk Print Hub",
        "slug": "test-kiosk",
        "phone": "+91 99999 88888",
        "address": "Gate #3 Kiosk",
        "pin": "5555",
        "is_express_enabled": True,
    }
    res = client.post("/api/v1/auth/shop-register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["slug"] == "test-kiosk"

    # Verify login with newly registered shop and custom PIN 5555
    res_login = client.post("/api/v1/auth/shop-login", json={"pin": "5555", "shop_slug": "test-kiosk"})
    assert res_login.status_code == 200
    assert res_login.json()["success"] is True

def test_update_shop_pin():
    # Update PIN for test-kiosk to 7777
    res_update = client.put("/api/v1/shop/pin", json={"shop_slug": "test-kiosk", "pin": "7777"})
    assert res_update.status_code == 200
    assert res_update.json()["success"] is True

    # Login with old PIN 5555 should fail
    res_old = client.post("/api/v1/auth/shop-login", json={"pin": "5555", "shop_slug": "test-kiosk"})
    assert res_old.status_code == 401

    # Login with new PIN 7777 should succeed
    res_new = client.post("/api/v1/auth/shop-login", json={"pin": "7777", "shop_slug": "test-kiosk"})
    assert res_new.status_code == 200
    assert res_new.json()["success"] is True

if __name__ == "__main__":
    pytest.main(["-v", __file__])
