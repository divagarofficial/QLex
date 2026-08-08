import razorpay

from app.core.config import settings


class RazorpayClient:

    def __init__(self):

        print("KEY ID:", settings.RAZORPAY_KEY_ID)
        print("SECRET PREFIX:", settings.RAZORPAY_KEY_SECRET[:6])

        self.client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

    def create_order(
        self,
        amount: int,
        receipt: str,
    ):

        return self.client.order.create(
            {
                "amount": amount,
                "currency": "INR",
                "receipt": receipt,
                "payment_capture": 1,
            }
        )

    def verify_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ):

        self.client.utility.verify_payment_signature(
            {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }
        )

        return True
    
    #==================================
    #WEBHOOK VERIFICATION
    #==================================
    def verify_webhook_signature(
    self,
    body: str,
    signature: str,
):

        self.client.utility.verify_webhook_signature(
            body,
            signature,
            settings.RAZORPAY_WEBHOOK_SECRET,
        )

        return True