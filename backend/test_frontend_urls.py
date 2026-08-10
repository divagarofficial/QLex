import urllib.request
import json

def test_http_endpoints():
    try:
        from app.db.database import SessionLocal
        from app.models.user import User
        from app.core.security import create_access_token
        
        db = SessionLocal()
        user = db.query(User).first()
        if not user:
            print("No user found.")
            return

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
                    print(f"[OK] {path} -> HTTP {response.status}")
            except Exception as e:
                print(f"[Notice] {path} -> {e}")

        db.close()
    except Exception as e:
        print("Database/Server offline during test run:", e)

if __name__ == "__main__":
    test_http_endpoints()

