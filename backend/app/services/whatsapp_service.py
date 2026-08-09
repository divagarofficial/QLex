import os
import logging
import requests
from typing import Optional, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

WHATSAPP_BOT_URL = os.getenv("WHATSAPP_BOT_URL", "http://localhost:5001")


class WhatsAppService:
    def __init__(self, bot_url: str = None):
        self._custom_bot_url = bot_url

    @property
    def bot_url(self) -> str:
        if self._custom_bot_url:
            return self._custom_bot_url.rstrip("/")
        from app.core.config import settings
        url = getattr(settings, "WHATSAPP_BOT_URL", "") or os.getenv("WHATSAPP_BOT_URL", "") or "http://localhost:5001"
        return url.rstrip("/")

    def is_enabled(self, db: Session) -> bool:
        """Check if WhatsApp notifications are enabled in Admin Platform Settings."""
        try:
            from app.admin.platform_settings_service import PlatformSettingsService
            service = PlatformSettingsService(db)
            settings = service.get_settings()
            if isinstance(settings, dict):
                notifications = settings.get("notifications", {}) or {}
                return bool(notifications.get("whatsappNotifications", False))
            elif hasattr(settings, "notifications"):
                notifications = getattr(settings, "notifications", {}) or {}
                if isinstance(notifications, dict):
                    return bool(notifications.get("whatsappNotifications", False))
            return False
        except Exception as e:
            logger.warning(f"[WhatsAppService] Could not check platform settings: {e}")
            return False

    def send_message(self, phone: str, message: str, pdf_path: Optional[str] = None) -> dict:
        """Send a WhatsApp message (with optional PDF attachment) via local whatsapp-web.js microservice."""
        if not phone:
            return {"success": False, "error": "No phone number provided"}

        try:
            url = f"{self.bot_url}/send"
            payload = {"phone": phone, "message": message}
            if pdf_path:
                payload["pdfPath"] = pdf_path
            response = requests.post(url, json=payload, timeout=8)
            data = response.json()
            if response.status_code == 200 and data.get("success"):
                logger.info(f"[WhatsAppService] Message sent to {phone}")
                return {"success": True, "data": data}
            else:
                logger.warning(f"[WhatsAppService] Bot returned error: {data}")
                return {"success": False, "error": data.get("error", "Unknown error")}
        except requests.exceptions.RequestException as e:
            logger.warning(f"[WhatsAppService] Could not connect to WhatsApp bot microservice at {self.bot_url}: {e}")
            return {"success": False, "error": f"Bot offline: {str(e)}"}

    def send_order_placed_receipt(
        self,
        db: Session,
        order: Any,
        student_name: str,
        phone: str,
        shop_name: str,
        token_number: Optional[str] = None
    ):
        """Send concise Order Confirmation with PDF Receipt attached to the student on WhatsApp."""
        if not self.is_enabled(db):
            logger.info("[WhatsAppService] WhatsApp notifications disabled in platform settings.")
            return

        try:
            order_id = str(getattr(order, "id", ""))[:8].upper()
            total_amount = float(getattr(order, "grand_total", getattr(order, "subtotal", 0.0)))
            payment_status = getattr(order, "payment_status", "PAID")
            if hasattr(payment_status, "value"):
                payment_status = payment_status.value

            # Generate PDF Receipt using reportlab utility
            pdf_path = None
            try:
                from app.utils.receipt_generator import generate_order_receipt_pdf
                pdf_path = generate_order_receipt_pdf(order, token_number=token_number, shop_name=shop_name)
            except Exception as pdf_err:
                logger.error(f"[WhatsAppService] Could not generate receipt PDF: {pdf_err}")

            token_str = f" Token #: *{token_number}* |" if token_number else ""

            # Clean & concise WhatsApp message
            msg = (
                f"🧾 *QLex Order Confirmation*\n\n"
                f"Hi *{student_name}*, your order *#{order_id}* at *{shop_name}* is confirmed!\n"
                f"📋{token_str} Total Paid: *₹{total_amount:.2f}* ({payment_status})\n\n"
                f"📎 Attached is your official QLex PDF Receipt.\n"
                f"We will notify you here as soon as your printing starts!"
            )

            self.send_message(phone, msg, pdf_path=pdf_path)
        except Exception as e:
            logger.error(f"[WhatsAppService] Error sending order receipt WhatsApp message: {e}")

    def send_status_update(
        self,
        db: Session,
        order_id: str,
        student_name: str,
        phone: str,
        shop_name: str,
        status: str,
        token_number: Optional[str] = None,
        reason: Optional[str] = None
    ):
        """Send status update notification to the student on WhatsApp."""
        if not self.is_enabled(db):
            return

        try:
            short_id = str(order_id)[:8]
            status_clean = str(status).upper()
            token_str = f" Token #: *{token_number}*." if token_number else ""

            if "PRINTING" in status_clean:
                msg = (
                    f"🖨️ *QLex Order Update*\n\n"
                    f"Hi *{student_name}*, your order *#{short_id}* at *{shop_name}* is now *PRINTING*.\n"
                    f"Please stand by for pickup notification!"
                )
            elif "READY" in status_clean:
                msg = (
                    f"🛍️ *QLex Order Ready for Pickup!*\n\n"
                    f"Hi *{student_name}*, your order *#{short_id}* is *READY FOR PICKUP* at *{shop_name}*!{token_str}\n"
                    f"Please bring your token or register number to collect your documents."
                )
            elif "SERVED" in status_clean or "COMPLETED" in status_clean:
                msg = (
                    f"✅ *QLex Order Completed*\n\n"
                    f"Hi *{student_name}*, your order *#{short_id}* has been marked as completed.\n"
                    f"Thank you for printing with QLex!"
                )
            elif "REJECTED" in status_clean or "CANCELLED" in status_clean:
                reason_str = f"\nReason: _{reason}_" if reason else ""
                msg = (
                    f"❌ *QLex Order Status Alert*\n\n"
                    f"Hi *{student_name}*, your order *#{short_id}* was cancelled/rejected.{reason_str}\n"
                    f"If you have questions, please check with {shop_name} counter."
                )
            else:
                msg = (
                    f"🔔 *QLex Order Update*\n\n"
                    f"Hi *{student_name}*, your order *#{short_id}* status is now: *{status_clean}*."
                )

            self.send_message(phone, msg)
        except Exception as e:
            logger.error(f"[WhatsAppService] Error sending status update WhatsApp message: {e}")


whatsapp_service = WhatsAppService()
