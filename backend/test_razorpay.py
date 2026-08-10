import os
import razorpay

def test_razorpay_client_init():
    key_id = os.getenv("RAZORPAY_KEY_ID", "YOUR_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "YOUR_KEY_SECRET")
    client = razorpay.Client(auth=(key_id, key_secret))
    assert client is not None

if __name__ == "__main__":
    try:
        client = razorpay.Client(auth=("YOUR_KEY_ID", "YOUR_KEY_SECRET"))
        print(client.order.create({"amount": 100, "currency": "INR", "receipt": "test123"}))
    except Exception as e:
        print("Razorpay test execution fallback:", e)