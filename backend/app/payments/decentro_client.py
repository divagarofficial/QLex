import logging
import requests
from typing import Optional, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class DecentroClient:
    """
    Decentro API Client for QLex Instant T+0 Settlements & Auto-Verification.
    Integrates with Decentro Payments / Virtual Account (uVA) APIs.
    """

    def __init__(self):
        self.base_url = settings.DECENTRO_BASE_URL.rstrip("/")
        self.client_id = settings.DECENTRO_CLIENT_ID
        self.client_secret = settings.DECENTRO_CLIENT_SECRET
        self.master_urn = settings.DECENTRO_MASTER_CONSUMER_URN

    def _get_headers(self) -> Dict[str, str]:
        return {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "Content-Type": "application/json",
        }

    def generate_dynamic_upi_link(
        self,
        order_id: str,
        amount: float,
        shop_name: str = "QLex Print Hub",
        payee_account: Optional[str] = None,
        callback_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generates a dynamic UPI Collection link & QR code for a student order.
        Directs payments to Decentro Virtual VPA with real-time IMPS auto-sweep.
        """
        endpoint = f"{self.base_url}/v2/payments/upi/link"
        reference_id = f"QLX_{order_id[:8]}"
        cb_url = callback_url or "https://qlex-backend-ybnb435gbq-el.a.run.app/orders/decentro-webhook"

        payload = {
            "reference_id": reference_id,
            "payee_account": payee_account or "YOUR_SBI_ACCOUNT_NUMBER",
            "amount": float(amount),
            "purpose_message": f"QLex Print Order #{order_id[:6]} @ {shop_name}",
            "generate_qr": True,
            "callback_url": cb_url,
        }


        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=self._get_headers(),
                timeout=12,
            )
            data = response.json()

            if response.status_code in (200, 201) and data.get("status") in ("SUCCESS", "SUCCESSFUL"):
                res_data = data.get("data", {})
                return {
                    "success": True,
                    "decentro_txn_id": data.get("decentro_txn_id"),
                    "reference_id": reference_id,
                    "upi_intent": res_data.get("upi_intent_url") or res_data.get("encoded_dynamic_qr_url"),
                    "qr_code_url": res_data.get("qr_code_url"),
                }

            error_msg = data.get("message") or data.get("response_message") or "Failed to generate Decentro UPI Link"
            logger.warning(f"[DecentroClient] Response Warning: {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "decentro_txn_id": data.get("decentro_txn_id"),
            }
        except Exception as err:
            logger.error(f"[DecentroClient] Exception: {err}")
            return {
                "success": False,
                "error": str(err),
            }

    def verify_transaction_status(self, decentro_txn_id: str) -> Dict[str, Any]:
        """
        Checks the status of a payment transaction directly with Decentro.
        """
        endpoint = f"{self.base_url}/v2/payments/transaction/{decentro_txn_id}/status"
        try:
            response = requests.get(
                endpoint,
                headers=self._get_headers(),
                timeout=10,
            )
            data = response.json()
            return data
        except Exception as err:
            logger.error(f"[DecentroClient] Transaction status lookup failed: {err}")
            return {"status": "ERROR", "message": str(err)}
