from app.db.database import SessionLocal

from app.seeds.departments import seed_departments
from app.seeds.sections import seed_sections
from app.seeds.years import seed_years


def seed_database():
    db = SessionLocal()

    try:
        print("Seeding Departments...")
        seed_departments(db)

        print("Seeding Years...")
        seed_years(db)

        print("Seeding Sections...")
        seed_sections(db)

        print("Database seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()