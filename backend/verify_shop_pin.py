import sys
from app.db.database import SessionLocal, engine
from app.db.base import Base
from app.models.shop_model import Shop
from app.seeds.seed_shops import seed_shops
from app.shop.repository import ShopRepository
from app.shop.service import ShopService
from app.auth.schemas import ShopRegisterRequest

def run_verification():
    print("--> Ensuring database tables exist & seeding shops...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seed_shops(db)
        repo = ShopRepository(db)
        service = ShopService(db)

        # 1. Verify Default Seeding
        print("\n[1/4] Verifying default shop PINs...")
        rit_shop = repo.get_shop_by_slug("rit")
        assert rit_shop is not None, "RIT shop not found!"
        assert rit_shop.access_pin == "0810", f"RIT PIN expected '0810', got '{rit_shop.access_pin}'"

        acme_shop = repo.get_shop_by_slug("acme")
        assert acme_shop is not None, "Acme shop not found!"
        assert acme_shop.access_pin == "1234", f"Acme PIN expected '1234', got '{acme_shop.access_pin}'"
        print("  [OK] Default PINs verified successfully: RIT='0810', Acme='1234'")

        # 2. Verify Authentication with PIN
        print("\n[2/4] Verifying shop PIN authentication...")
        auth_rit = repo.authenticate_shop(pin="0810", shop_slug="rit")
        assert auth_rit is not None and auth_rit.slug == "rit", "Failed to authenticate RIT with PIN 0810"

        auth_acme = repo.authenticate_shop(pin="1234", shop_slug="acme")
        assert auth_acme is not None and auth_acme.slug == "acme", "Failed to authenticate Acme with PIN 1234"

        auth_bad = repo.authenticate_shop(pin="9999", shop_slug="rit")
        assert auth_bad is None, "Wrong PIN 9999 should return None!"
        print("  [OK] Shop PIN authentication verified!")

        # 3. Verify Non-College Shop Registration with Custom 4-Digit PIN
        print("\n[3/4] Verifying Non-College Shop Registration with custom PIN...")
        reg_req = ShopRegisterRequest(
            name="Metro Express Prints",
            slug="metro-express",
            phone="+91 91111 22222",
            email="metro@expressprint.com",
            address="Metro Station Gate 1 Kiosk",
            pin="7890",
            is_express_enabled=True,
        )

        existing_metro = repo.get_shop_by_slug("metro-express")
        if existing_metro:
            db.delete(existing_metro)
            db.commit()

        new_shop = service.register_shop(reg_req)
        assert new_shop.slug == "metro-express", "Registration failed!"
        assert new_shop.access_pin == "7890", f"Expected PIN '7890', got '{new_shop.access_pin}'"

        auth_metro = repo.authenticate_shop(pin="7890", shop_slug="metro-express")
        assert auth_metro is not None, "Failed to authenticate newly registered shop with PIN 7890"
        print("  [OK] Non-College Shop 'Metro Express Prints' registered and authenticated with custom PIN 7890!")

        # 4. Verify PIN Update
        print("\n[4/4] Verifying 4-digit PIN update...")
        updated_shop = service.update_shop_pin("metro-express", "4321")
        assert updated_shop.access_pin == "4321", f"Expected PIN '4321', got '{updated_shop.access_pin}'"

        auth_old = repo.authenticate_shop(pin="7890", shop_slug="metro-express")
        assert auth_old is None, "Old PIN 7890 should no longer authenticate!"

        auth_new = repo.authenticate_shop(pin="4321", shop_slug="metro-express")
        assert auth_new is not None, "New PIN 4321 failed to authenticate!"
        print("  [OK] Shop PIN updated to 4321 and verified successfully!")

        print("\n=== ALL SHOP 4-DIGIT PIN VERIFICATIONS PASSED SUCCESSFULLY! ===")


    finally:
        db.close()

if __name__ == "__main__":
    run_verification()
