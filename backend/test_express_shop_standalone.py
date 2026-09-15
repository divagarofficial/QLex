import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, init_db_tables
from app.models.shop_model import Shop
from app.models.order import Order
from app.orders.express_router import (
    list_public_shops,
    get_public_shop_by_slug,
    create_express_draft,
    get_express_order_status,
)
from app.orders.express_schemas import CreateExpressDraftRequest
from fastapi import HTTPException


def run_tests():
    print("Initializing DB tables and seeders...")
    init_db_tables()

    db = SessionLocal()
    try:
        # 1. Test listing public shops
        print("\n1. Testing list_public_shops...")
        shops = list_public_shops(db=db)
        slugs = [s.slug for s in shops]
        print(f"Discovered shops: {slugs}")
        assert "rit" in slugs, "Expected 'rit' in shops"
        assert "acme" in slugs, "Expected 'acme' in shops"
        print("[OK] Public shops listed successfully.")

        # 2. Test getting public shop by slug
        print("\n2. Testing get_public_shop_by_slug...")
        acme = get_public_shop_by_slug("acme", db=db)
        assert acme.is_express_enabled is True, "Acme should have is_express_enabled=True"
        assert acme.requires_account is False, "Acme should have requires_account=False"
        print(f"[OK] Acme resolved: Name='{acme.name}', Express={acme.is_express_enabled}")

        rit = get_public_shop_by_slug("rit", db=db)
        assert rit.is_express_enabled is False, "RIT should have is_express_enabled=False"
        assert rit.requires_account is True, "RIT should have requires_account=True"
        print(f"[OK] RIT resolved: Name='{rit.name}', RequiresAccount={rit.requires_account}")

        # 3. Test express order attempt on campus shop (RIT) -> should be forbidden
        print("\n3. Testing forbidden express order on campus shop (RIT)...")
        try:
            create_express_draft(
                request=CreateExpressDraftRequest(
                    phone="9876543210",
                    full_name="Test Student",
                    shop_slug="rit"
                ),
                db=db
            )
            assert False, "Should have raised HTTPException 403"
        except HTTPException as he:
            assert he.status_code == 403
            print(f"[OK] Correctly rejected express order on RIT: {he.detail}")

        # 4. Test express order on express shop (Acme) -> should succeed
        print("\n4. Testing express draft order creation on Acme...")
        draft_resp = create_express_draft(
            request=CreateExpressDraftRequest(
                phone="9876543210",
                full_name="Express Customer",
                shop_slug="acme",
                is_priority=False
            ),
            db=db
        )
        print(f"Created express order: ID={draft_resp.order_id}, GuestPhone={draft_resp.guest_phone}")
        assert draft_resp.guest_phone == "9876543210"
        assert draft_resp.shop_slug == "acme"
        assert draft_resp.status == "draft"
        print("[OK] Express draft order created successfully.")

        # 5. Test express order live status endpoint
        print("\n5. Testing get_express_order_status...")
        status_resp = get_express_order_status(order_id=draft_resp.order_id, db=db)
        assert status_resp.order_id == draft_resp.order_id
        assert status_resp.guest_phone == "9876543210"
        assert status_resp.shop_name == "Acme Print Hub"
        assert status_resp.payment_status == "pending"
        print(f"[OK] Order status fetched successfully: {status_resp.shop_name}, status={status_resp.status}")

        print("\n ALL EXPRESS BACKEND TESTS PASSED CLEANLY!")
    finally:
        db.close()


if __name__ == "__main__":
    run_tests()
