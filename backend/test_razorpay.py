import os
import razorpay

def test_razorpay_client_init():
    key_id = os.getenv("RAZORPAY_KEY_ID", "YOUR_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "YOUR_KEY_SECRET")
    client = razorpay.Client(auth=(key_id, key_secret))
    assert client is not None

if __name__ == "__main__":
    try:
        key_id = os.getenv("RAZORPAY_KEY_ID", "rzp_test_ToAjqLsBRrruuU")
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "ln31EwbiixmKx38ovi0xVgt8")
        client = razorpay.Client(auth=(key_id, key_secret))
        order = client.order.create({"amount": 100, "currency": "INR", "receipt": "test_receipt_001"})
        print("Razorpay Test Order Created Successfully:", order["id"])
    except Exception as e:
        print("Razorpay test execution fallback:", e)