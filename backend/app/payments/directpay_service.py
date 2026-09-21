import logging
from urllib.parse import quote
from typing import Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class DirectPayService:
    """
    QLex DirectPay Engine for Airtel Payments Bank.
    Generates pre-filled NPCI UPI intents for 'thirudiva@upi' under 'MINDURA TECHNOLOGIES'.
    Handles 0-second T+0 direct bank settlements with automated notification relay matching.
    """

    def __init__(self):
        self.upi_id = settings.DIRECTPAY_UPI_ID
        self.payee_name = settings.DIRECTPAY_PAYEE_NAME
        self.account_number = settings.DIRECTPAY_ACCOUNT_NUMBER
        self.ifsc = settings.DIRECTPAY_IFSC_CODE

    def generate_upi_intent(self, order_id: str, amount: float, shop_name: str = "QLex Print Hub") -> Dict[str, Any]:
        """
        Generates native pre-filled NPCI UPI Intent link for mobile UPI app selector (GPay, PhonePe, Paytm, BHIM).
        Payee is set to MINDURA TECHNOLOGIES (thirudiva@upi).
        """
        ref_code = f"QLX_{order_id[:8]}"
        formatted_amount = f"{float(amount):.2f}"
        encoded_name = quote(self.payee_name)
        encoded_note = quote(f"QLex Print Order #{order_id[:6]} @ {shop_name}")

        # Native NPCI UPI Intent URI format
        upi_intent_url = (
            f"upi://pay?pa={self.upi_id}"
            f"&pn={encoded_name}"
            f"&am={formatted_amount}"
            f"&tn={ref_code}"
            f"&cu=INR"
        )

        return {
            "success": True,
            "order_id": order_id,
            "reference_code": ref_code,
            "amount": float(amount),
            "payee_vpa": self.upi_id,
            "payee_name": self.payee_name,
            "account_number_masked": f"•••• •••• {self.account_number[-4:]}",
            "ifsc": self.ifsc,
            "upi_intent_url": upi_intent_url,
        }

    def parse_airtel_sms(self, sms_text: str) -> Dict[str, Any]:
        """
        Parses Airtel Payments Bank credit SMS format:
        'Airtel Payments Bank a/c is credited with Rs.400.00. Txn ID: 618351692231. Call 180023400 for help'
        """
        import re

        amount = None
        txn_id = None
        ref_code = None

        # Extract Amount (e.g., Rs.400.00 or Rs. 400)
        amt_match = re.search(r"(?:credited\s+with|credit\s+of)\s+Rs\.?\s*([0-9]+(?:\.[0-9]{1,2})?)", sms_text, re.IGNORECASE)
        if amt_match:
            try:
                amount = float(amt_match.group(1))
            except ValueError:
                pass

        # Extract Txn ID (e.g., Txn ID: 618351692231)
        txn_match = re.search(r"Txn\s+ID:\s*([0-9A-Za-z]+)", sms_text, re.IGNORECASE)
        if txn_match:
            txn_id = txn_match.group(1)

        # Extract QLex Ref Code if embedded
        ref_match = re.search(r"QLX_([0-9a-fA-F]+)", sms_text, re.IGNORECASE)
        if ref_match:
            ref_code = f"QLX_{ref_match.group(1)}"

        return {
            "is_credit": bool(amount or txn_id),
            "amount": amount,
            "txn_id": txn_id,
            "reference_code": ref_code,
            "raw_sms": sms_text,
        }

