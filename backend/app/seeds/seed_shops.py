from sqlalchemy.orm import Session
from app.models.shop_model import Shop


def seed_shops(db: Session):
    default_shops = [
        {
            "name": "RIT Central Print Hub",
            "slug": "rit",
            "tagline": "Official College Campus Print Center",
            "description": "Exclusive print hub for college students and faculty. Requires official college register number login.",
            "address": "Campus Ground Floor, Near Main Auditorium",
            "phone": "+91 94440 12345",
            "email": "printhub@rit.edu",
            "is_express_enabled": False,
            "requires_account": True,
            "is_active": True,
            "operating_hours": "8:30 AM - 5:30 PM",
            "access_pin": "0810",
        },
        {
            "name": "Acme Print Hub",
            "slug": "acme",
            "tagline": "Fast Express Prints • No Login Required",
            "description": "Instant walk-in and counter print kiosk. Simply enter your mobile number, upload your file, pay via UPI, and pick up!",
            "address": "Tech Park Gate 2, Commercial Complex, Counter #1",
            "phone": "+91 98880 54321",
            "email": "express@acmeprint.com",
            "is_express_enabled": True,
            "requires_account": False,
            "is_active": True,
            "operating_hours": "8:00 AM - 9:00 PM",
            "access_pin": "1234",
        }
    ]

    for data in default_shops:
        existing = db.query(Shop).filter(Shop.slug == data["slug"]).first()
        if not existing:
            shop = Shop(**data)
            db.add(shop)
        else:
            # Update express and account requirements if already exists
            existing.name = data["name"]
            existing.tagline = data["tagline"]
            existing.is_express_enabled = data["is_express_enabled"]
            existing.requires_account = data["requires_account"]
            existing.is_active = data["is_active"]
            existing.access_pin = data["access_pin"]


    
    db.commit()
