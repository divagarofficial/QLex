import requests

def test_live_staff_order():
    url = "http://localhost:8000/api/v1/auth/staff/login"
    login_res = requests.post(url, json={
        "staff_id": "STF-2026",
        "password": "password123"
    })
    print("Login status:", login_res.status_code)
    if login_res.status_code != 200:
        print("Login response:", login_res.text)
        return

    data = login_res.json()
    token = data["access_token"]
    print("Obtained Staff JWT Token:", token[:25] + "...")

    print("Sending POST /orders without X-Waiting-Room-Session header...")
    order_res = requests.post("http://localhost:8000/orders", json={
        "is_priority": False
    }, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })

    print("POST /orders Status Code:", order_res.status_code)
    print("POST /orders Response:", order_res.text)
    assert order_res.status_code == 200
    print("\n=== LIVE POST /ORDERS STAFF BYPASS VERIFIED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_live_staff_order()
