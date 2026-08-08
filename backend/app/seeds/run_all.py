from app.db.database import SessionLocal

from app.seeds.seed_platform_settings import seed_platform_settings
from app.seeds.seed_pricing import seed_pricing
from app.seeds.seed_services import seed_services
from app.seeds.departments import seed_departments
from app.seeds.years import seed_years
from app.seeds.sections import seed_sections


def main():
    db = SessionLocal()

    try:
        print("Seeding Departments...")
        seed_departments(db)

        print("Seeding Years...")
        seed_years(db)

        print("Seeding Sections...")
        seed_sections(db)

        seed_services(db)
        seed_platform_settings(db)
        seed_pricing(db)

        print("✅ Database Seeded Successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    main()
