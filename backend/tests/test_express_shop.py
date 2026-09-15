from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db_tables

client = TestClient(app)


def test_express_shops_and_order_flow():
    # Ensure tables and seeds are initialized
    init_db_tables()

    # 1. Fetch public shop directory
    response = client.get("/shops/public")
    assert response.status_code == 200
    shops = response.json()
    assert len(shops) >= 2
    slugs = [s["slug"] for s in shops]
    assert "rit" in slugs
    assert "acme" in slugs

    # 2. Fetch specific public shop by slug
    acme_res = client.get("/shops/public/acme")
    assert acme_res.status_code == 200
    acme_data = acme_res.json()
    assert acme_data["slug"] == "acme"
    assert acme_data["is_express_enabled"] is True
    assert acme_data["requires_account"] is False

    rit_res = client.get("/shops/public/rit")
    assert rit_res.status_code == 200
    rit_data = rit_res.json()
    assert rit_data["slug"] == "rit"
    assert rit_data["is_express_enabled"] is False
    assert rit_data["requires_account"] is True

    # 3. Attempt express order on campus shop (RIT) -> should be forbidden
    rit_order_res = client.post("/orders/express/create", json={
        "phone": "9876543210",
        "full_name": "Test Student",
        "shop_slug": "rit"
    })
    assert rit_order_res.status_code == 403

    # 4. Create express order on express shop (Acme) -> should succeed
    express_order_res = client.post("/orders/express/create", json={
        "phone": "9876543210",
        "full_name": "Express Guest",
        "shop_slug": "acme"
    })
    assert express_order_res.status_code == 200
    order_data = express_order_res.json()
    assert "order_id" in order_data
    assert order_data["guest_phone"] == "9876543210"
    assert order_data["guest_name"] == "Express Guest"
    assert order_data["shop_slug"] == "acme"
    order_id = order_data["order_id"]

    # 5. Check public status endpoint
    status_res = client.get(f"/orders/express/{order_id}/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["order_id"] == order_id
    assert status_data["guest_phone"] == "9876543210"
    assert status_data["shop_slug"] == "acme"
    assert status_data["payment_status"] == "pending"
