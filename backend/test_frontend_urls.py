import urllib.request
import json
from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token

def test_http_endpoints():
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        print("No user found.")
        return

    # Create JWT token for testing
    token = create_access_token({"sub": str(user.id)})

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    endpoints = [
        "/student/live-queue",
        "/student/token",
        "/student/orders",
        "/student/payments",
    ]

    for path in endpoints:
        url = f"http://localhost:8000{path}"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                print(f"[OK] {path} -> HTTP {response.status} | Data received: {list(data.keys())}")
        except urllib.error.HTTPError as e:
            print(f"[HTTP Error] {path} -> HTTP {e.code}: {e.read().decode()}")
        except Exception as e:
            print(f"[ERROR] {path} -> {e}")

    db.close()

if __name__ == "__main__":
    test_http_endpoints()
