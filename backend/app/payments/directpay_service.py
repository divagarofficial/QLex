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

        # NPCI Account+IFSC Auto-Resolver VPA format: <ACCOUNT>@<IFSC>.ifsc.npci
        account_ifsc_vpa = f"{self.account_number}@{self.ifsc}.ifsc.npci"

        # Pre-filled NPCI Account + IFSC Bank Transfer Intent URI (GPay, PhonePe, Paytm, BHIM)
        bank_transfer_intent_url = (
            f"upi://pay?pa={account_ifsc_vpa}"
            f"&pn={encoded_name}"
            f"&tr={ref_code}"
            f"&tn={ref_code}"
            f"&am={formatted_amount}"
            f"&cu=INR"
        )

        # Standard VPA Intent URI format
        upi_intent_url = (
            f"upi://pay?pa={self.upi_id}"
            f"&pn={encoded_name}"
            f"&tr={ref_code}"
            f"&tn={ref_code}"
            f"&am={formatted_amount}"
            f"&cu=INR"
            f"&mc=5999"
        )

        return {
            "success": True,
            "order_id": order_id,
            "reference_code": ref_code,
            "amount": float(amount),
            "payee_vpa": self.upi_id,
            "payee_name": self.payee_name,
            "account_number": self.account_number,
            "ifsc": self.ifsc,
            "account_ifsc_vpa": account_ifsc_vpa,
            "account_number_masked": f"•••• •••• {self.account_number[-4:]}",
            "upi_intent_url": bank_transfer_intent_url,
            "standard_upi_intent_url": upi_intent_url,
        }

    def parse_airtel_sms(self, sms_text: str) -> Dict[str, Any]:
        """
        Parses Airtel Payments Bank, SBI, HDFC, ICICI, PhonePe, Paytm, etc. credit SMS format:
        e.g., 'Airtel Payments Bank a/c is credited with Rs.400.00. Txn ID: 618351692231.'
        e.g., 'Rs. 1.50 credited to your A/c ending 1234 on 21-Sep-26 via UPI Ref No 618351692231.'
        """
        import re

        amount = None
        txn_id = None
        ref_code = None

        if not sms_text:
            return {"is_credit": False, "amount": None, "txn_id": None, "reference_code": None, "raw_sms": ""}

        # 1. Amount Extraction (handles "credited with Rs.1.50", "credit of Rs 1.50", "received Rs 1.50", "Rs.1.50 credited")
        amt_match = re.search(
            r"(?:credited\s+(?:with|by|for)|credit\s+of|received|recieved|payment\s+of)\s*(?:Rs\.?|INR|₹)?\s*([0-9]+(?:\.[0-9]{1,2})?)|(?:Rs\.?|INR|₹)\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:credited|received)",
            sms_text,
            re.IGNORECASE,
        )
        if amt_match:
            try:
                amt_str = amt_match.group(1) or amt_match.group(2)
                if amt_str:
                    amount = float(amt_str)
            except ValueError:
                pass

        # Fallback Amount regex if explicit prefix missed: e.g. "Rs.1.50" or "Rs 45.00"
        if amount is None:
            fallback_match = re.search(r"(?:Rs\.?|INR|₹)\s*([0-9]+\.[0-9]{1,2})", sms_text, re.IGNORECASE)
            if fallback_match:
                try:
                    amount = float(fallback_match.group(1))
                except ValueError:
                    pass

        # 2. Extract Txn ID / UTR (e.g. Txn ID: 618351692231, UPI/618351692231, Ref 618351692231, UTR 618351692231)
        txn_match = re.search(
            r"(?:Txn\s*ID|Transaction\s*ID|Ref\s*No|UPI/|UTR|Ref:?)\s*:?\s*([0-9A-Za-z]+)",
            sms_text,
            re.IGNORECASE,
        )
        if txn_match:
            txn_id = txn_match.group(1)

        # 3. Extract QLex Ref Code if embedded
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

    def parse_bank_sms(self, sms_text: str) -> Dict[str, Any]:
        """Alias for parse_airtel_sms for multi-bank support."""
        return self.parse_airtel_sms(sms_text)


