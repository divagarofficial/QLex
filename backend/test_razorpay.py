import razorpay

client = razorpay.Client(
    auth=(
        "YOUR_KEY_ID",
        "YOUR_KEY_SECRET",
    )
)

print(
    client.order.create(
        {
            "amount": 100,
            "currency": "INR",
            "receipt": "test123",
        }
    )
)