import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app.db.database import engine

def test_database_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            assert result is not None
            print("✅ Database Connected Successfully!")
    except Exception as e:
        print("❌ Database Connection Notice:", e)

if __name__ == "__main__":
    test_database_connection()