"""
Standalone database initialization and seeding script.
Can be executed manually or in container deployment pipelines:
    python -m app.db.init_and_seed
"""
from app.db.database import init_db_tables

if __name__ == "__main__":
    print("[DB Init] Running database table creation and initial seeding...")
    init_db_tables()
    print("[DB Init] Completed successfully!")
