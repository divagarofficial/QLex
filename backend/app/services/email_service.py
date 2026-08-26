import os
import logging
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

IST = timezone(timedelta(hours=5, minutes=30))


class EmailService:
    def __init__(self):
        self._sent_order_emails = set()
        self._email_lock = threading.Lock()

    def is_enabled(self, db: Session = None) -> bool:
        """Check if Email notifications are enabled in Admin Platform Settings."""
        if not db:
            return True
        try:
            from app.admin.platform_settings_service import PlatformSettingsService
            service = PlatformSettingsService(db)
            settings = service.get_settings()
            if isinstance(settings, dict):
                notifications = settings.get("notifications", {}) or {}
                if "emailNotifications" in notifications:
                    return bool(notifications.get("emailNotifications"))
            elif hasattr(settings, "notifications"):
                notifications = getattr(settings, "notifications", {}) or {}
                if isinstance(notifications, dict) and "emailNotifications" in notifications:
                    return bool(notifications.get("emailNotifications"))
            return True
        except Exception as e:
            logger.warning(f"[EmailService] Could not check platform settings: {e}")
            return True

    def _send_smtp_email(
        self,
        to_email: str,
        subject: str,
        text_body: str,
        html_body: str,
        attachment_path: Optional[str] = None,
        attachment_paths: Optional[list[str]] = None
    ) -> bool:
        """Helper to dispatch SMTP email with optional attachments."""
        if not to_email or "@" not in to_email:
            return False

        from app.core.config import settings
        host = getattr(settings, "SMTP_HOST", "smtp.gmail.com") or os.getenv("SMTP_HOST", "smtp.gmail.com")
        port = int(getattr(settings, "SMTP_PORT", 587) or os.getenv("SMTP_PORT", 587))
        user = getattr(settings, "SMTP_USER", "divagar.240075@aids.ritchennai.edu.in") or os.getenv("SMTP_USER", "")
        pwd = getattr(settings, "SMTP_PASSWORD", "eprzscarycrjwnda") or os.getenv("SMTP_PASSWORD", "")
        from_email = getattr(settings, "EMAILS_FROM_EMAIL", user) or user or "divagar.240075@aids.ritchennai.edu.in"
        from_name = "QLex"

        if not user or not pwd:
            logger.warning("[EmailService] SMTP user/password credentials missing. Skipping email dispatch.")
            return False

        try:
            all_attachments = []
            if attachment_path and os.path.exists(attachment_path):
                all_attachments.append(attachment_path)
            if attachment_paths:
                for ap in attachment_paths:
                    if ap and os.path.exists(ap) and ap not in all_attachments:
                        all_attachments.append(ap)

            msg = MIMEMultipart("mixed" if all_attachments else "alternative")
            msg["Subject"] = subject
            msg["From"] = f"{from_name} <{from_email}>"
            msg["To"] = to_email

            body_part = MIMEMultipart("alternative")
            body_part.attach(MIMEText(text_body, "plain"))
            body_part.attach(MIMEText(html_body, "html"))
            msg.attach(body_part)

            for ap in all_attachments:
                try:
                    with open(ap, "rb") as f:
                        fname = os.path.basename(ap)
                        part = MIMEApplication(f.read(), Name=fname)
                        part['Content-Disposition'] = f'attachment; filename="{fname}"'
                        msg.attach(part)
                except Exception as attach_err:
                    logger.error(f"[EmailService] Failed attaching file {ap}: {attach_err}")

            server = smtplib.SMTP(host, port, timeout=12)
            server.starttls()
            server.login(user, pwd)
            server.sendmail(from_email, [to_email], msg.as_string())
            server.quit()
            logger.info(f"[EmailService] Successfully sent email '{subject}' with {len(all_attachments)} attachment(s) to {to_email}")
            return True
        except Exception as e:
            logger.error(f"[EmailService] Error sending email to {to_email}: {e}")
            return False

    def send_order_placed_email(
        self,
        db: Session,
        order: Any,
        student_name: str,
        to_email: str,
        shop_name: str = "Print Hub",
        token_number: Optional[str] = None
    ):
        """Asynchronously sends Order Confirmation email with PDF Receipt attached."""
        if not self.is_enabled(db) or not to_email:
            return

        order_id_full = str(getattr(order, "id", ""))
        if not order_id_full:
            return

        # Deduplication check
        with self._email_lock:
            if order_id_full in self._sent_order_emails:
                return
            self._sent_order_emails.add(order_id_full)

        def _worker():
            try:
                order_id_short = order_id_full[:8].upper()
                grand_total = float(getattr(order, "grand_total", getattr(order, "subtotal", 0.0)))
                token_str = token_number if token_number else getattr(order, "token", "R-001")
                if not token_str.startswith("Token #") and not token_str.startswith("P-") and not token_str.startswith("R-"):
                    token_display = f"Token #{token_str}"
                else:
                    token_display = f"Token #{token_str}" if not token_str.startswith("Token #") else token_str

                # Generate PDF receipt
                pdf_path = None
                try:
                    from app.utils.receipt_generator import generate_order_receipt_pdf
                    pdf_path = generate_order_receipt_pdf(order, token_number=token_number, shop_name=shop_name)
                except Exception as pdf_err:
                    logger.error(f"[EmailService] Could not generate receipt PDF: {pdf_err}")

                formatted_now = datetime.now(timezone.utc).astimezone(IST).strftime("%b %d, %Y, %I:%M %p")

                subject = f"🧾 Order Confirmed! {token_display} — QLex"

                text_body = f"""
=====================================================
QLex | A PRODUCT OF MINDURA TECHNOLOGIES
=====================================================

Hi {student_name},

Your print order #{order_id_short} at {shop_name} has been confirmed!

Order Details:
-----------------------------------------------------
Pickup Token : {token_display}
Order ID     : #{order_id_short}
Total Paid   : ₹{grand_total:.2f} (PAID & CONFIRMED)
Date & Time  : {formatted_now} (IST)
Location     : {shop_name}

Attached is your official QLex PDF Receipt for your records.
We will notify you via Email and WhatsApp as soon as your printing begins!

© 2026 MINDURA TECHNOLOGIES. All rights reserved.
QLex • Rajalakshmi Institute of Technology
"""

                html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QLex Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #1e293b; border: 1px solid #334155; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #f59e0b;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px;">
                QLex
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                A PRODUCT OF MINDURA TECHNOLOGIES
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                  ✓ Payment Confirmed & Order Placed
                </span>
              </div>

              <h2 style="margin-top: 0; font-size: 18px; font-weight: 700; color: #f8fafc; text-align: center;">
                Order Confirmation 🧾
              </h2>
              <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center; margin-bottom: 24px;">
                Hi <strong style="color: #f8fafc;">{student_name}</strong>, your print order <strong style="color: #f59e0b;">#{order_id_short}</strong> at <strong>{shop_name}</strong> has been successfully received and added to the printing queue.
              </p>

              <!-- Token Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #0f172a; border: 2px dashed #f59e0b; border-radius: 16px; text-align: center;">
                <tr>
                  <td style="padding: 20px 16px;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; display: block; margin-bottom: 6px;">
                      Your Pickup Token Number
                    </span>
                    <span style="font-size: 32px; font-weight: 900; letter-spacing: 2px; color: #f59e0b; font-family: 'Courier New', Courier, monospace; display: inline-block;">
                      {token_display}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 13px; color: #94a3b8; padding: 6px 0;">Pickup Location:</td>
                  <td align="right" style="font-size: 14px; font-weight: 800; color: #f59e0b; padding: 6px 0;">{shop_name}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #94a3b8; padding: 6px 0;">Order ID:</td>
                  <td align="right" style="font-size: 13px; font-weight: 700; color: #f8fafc; padding: 6px 0;">#{order_id_short}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #94a3b8; padding: 6px 0;">Payment Gateway:</td>
                  <td align="right" style="font-size: 13px; font-weight: 600; color: #cbd5e1; padding: 6px 0;">Razorpay UPI / Card</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #94a3b8; padding: 6px 0;">Total Paid:</td>
                  <td align="right" style="font-size: 15px; font-weight: 800; color: #10b981; padding: 6px 0;">₹{grand_total:.2f}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #94a3b8; padding: 6px 0;">Time (IST):</td>
                  <td align="right" style="font-size: 12px; color: #cbd5e1; padding: 6px 0;">{formatted_now}</td>
                </tr>
              </table>

              <!-- Attachment Info -->
              <div style="background-color: rgba(2, 132, 199, 0.1); border: 1px solid rgba(2, 132, 199, 0.25); border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; color: #38bdf8; font-weight: 600;">
                  📎 Official QLex PDF Receipt & Uploaded Document(s) Attached
                </p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
                  Your detailed PDF receipt and uploaded print files are attached to this email for your reference.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 18px 24px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; font-size: 12px; color: #cbd5e1; font-weight: 600;">
                © 2026 MINDURA TECHNOLOGIES. All rights reserved.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                QLex • Rajalakshmi Institute of Technology
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

                attachments_list = []
                if pdf_path and os.path.exists(pdf_path):
                    attachments_list.append(pdf_path)

                if hasattr(order, "documents") and order.documents:
                    from app.utils.file_storage import get_draft_directory
                    for doc in order.documents:
                        fpath = getattr(doc, "storage_path", None)
                        if not fpath or not os.path.exists(fpath):
                            stored_name = getattr(doc, "stored_filename", "")
                            order_obj_id = getattr(order, "id", None)
                            if stored_name and order_obj_id:
                                possible_path = str(get_draft_directory(order_obj_id) / stored_name)
                                if os.path.exists(possible_path):
                                    fpath = possible_path
                        if fpath and os.path.exists(fpath) and fpath not in attachments_list:
                            attachments_list.append(fpath)

                self._send_smtp_email(to_email, subject, text_body, html_body, attachment_paths=attachments_list)
            except Exception as e:
                logger.error(f"[EmailService] Worker error in send_order_placed_email: {e}")

        threading.Thread(target=_worker, daemon=True).start()

    def send_status_update_email(
        self,
        db: Session,
        order_id: str,
        student_name: str,
        to_email: str,
        shop_name: str,
        status: str,
        token_number: Optional[str] = None,
        reason: Optional[str] = None
    ):
        """Email alerts are restricted to Order Placement Confirmation only. Status update emails are suppressed."""
        return

        def _worker():
            try:
                short_id = str(order_id)[:8].upper()
                status_clean = str(status).upper()
                token_display = f"Token #{token_number}" if token_number else f"Order #{short_id}"

                if "PRINTING" in status_clean:
                    subject = f"🖨️ Order #{short_id} is NOW PRINTING — QLex"
                    badge_color = "#38bdf8"
                    badge_bg = "rgba(56, 189, 248, 0.15)"
                    badge_border = "rgba(56, 189, 248, 0.3)"
                    badge_text = "🖨️ Printing in Progress"
                    message_intro = f"Hi <strong>{student_name}</strong>, your print order <strong>#{short_id}</strong> is currently on the printer at <strong>{shop_name}</strong>!"
                    action_note = "Your documents will be ready for pickup shortly. Stand by for the ready notification!"
                elif "READY" in status_clean:
                    subject = f"🛍️ READY FOR PICKUP! {token_display} — QLex"
                    badge_color = "#10b981"
                    badge_bg = "rgba(16, 185, 129, 0.15)"
                    badge_border = "rgba(16, 185, 129, 0.3)"
                    badge_text = "🛍️ READY FOR PICKUP"
                    message_intro = f"Hi <strong>{student_name}</strong>, great news! Your order <strong>#{short_id}</strong> is <strong>READY FOR PICKUP</strong> at <strong>{shop_name}</strong>!"
                    action_note = f"Please bring your token number <strong style='color:#f59e0b;'>{token_display}</strong> or student ID card to the <strong>{shop_name}</strong> counter to collect your documents."
                elif "SERVED" in status_clean or "COMPLETED" in status_clean:
                    subject = f"✅ Order #{short_id} Completed — QLex"
                    badge_color = "#10b981"
                    badge_bg = "rgba(16, 185, 129, 0.15)"
                    badge_border = "rgba(16, 185, 129, 0.3)"
                    badge_text = "✅ Order Completed"
                    message_intro = f"Hi <strong>{student_name}</strong>, your order <strong>#{short_id}</strong> has been marked as completed."
                    action_note = "Thank you for printing with QLex at RIT!"
                elif "REJECTED" in status_clean or "CANCELLED" in status_clean:
                    subject = f"❌ Order #{short_id} Status Update — QLex"
                    badge_color = "#ef4444"
                    badge_bg = "rgba(239, 68, 68, 0.15)"
                    badge_border = "rgba(239, 68, 68, 0.3)"
                    badge_text = "❌ Order Cancelled/Rejected"
                    reason_str = f"<p style='color:#f87171; font-weight:600;'>Reason: {reason}</p>" if reason else ""
                    message_intro = f"Hi <strong>{student_name}</strong>, your order <strong>#{short_id}</strong> was cancelled or rejected.{reason_str}"
                    action_note = f"If you have any questions, please speak directly with the {shop_name} counter staff."
                else:
                    subject = f"🔔 Order #{short_id} Update — QLex"
                    badge_color = "#38bdf8"
                    badge_bg = "rgba(56, 189, 248, 0.15)"
                    badge_border = "rgba(56, 189, 248, 0.3)"
                    badge_text = f"Status: {status_clean}"
                    message_intro = f"Hi <strong>{student_name}</strong>, your order <strong>#{short_id}</strong> status updated to: <strong>{status_clean}</strong>."
                    action_note = f"Check your QLex dashboard for real-time status updates."

                text_body = f"""
=====================================================
QLex | A PRODUCT OF MINDURA TECHNOLOGIES
=====================================================

Hi {student_name},

{badge_text}

Order ID     : #{short_id}
Token Number : {token_display}
Location     : {shop_name}

Details:
{action_note}

© 2026 MINDURA TECHNOLOGIES. All rights reserved.
QLex • Rajalakshmi Institute of Technology
"""

                html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #1e293b; border: 1px solid #334155; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #f59e0b;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px;">
                QLex
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                A PRODUCT OF MINDURA TECHNOLOGIES
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: {badge_bg}; color: {badge_color}; border: 1px solid {badge_border}; font-size: 13px; font-weight: 700; padding: 8px 18px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                  {badge_text}
                </span>
              </div>

              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; text-align: center; margin-bottom: 24px;">
                {message_intro}
              </p>

              <!-- Token Display Box if available -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #0f172a; border: 2px dashed #f59e0b; border-radius: 16px; text-align: center;">
                <tr>
                  <td style="padding: 20px 16px;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; display: block; margin-bottom: 6px;">
                      Pickup Token Number
                    </span>
                    <span style="font-size: 32px; font-weight: 900; letter-spacing: 2px; color: #f59e0b; font-family: 'Courier New', Courier, monospace; display: inline-block;">
                      {token_display}
                    </span>
                  </td>
                </tr>
              </table>

              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #f8fafc; line-height: 1.6;">
                  {action_note}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 18px 24px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; font-size: 12px; color: #cbd5e1; font-weight: 600;">
                © 2026 MINDURA TECHNOLOGIES. All rights reserved.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                QLex • Rajalakshmi Institute of Technology
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

                self._send_smtp_email(to_email, subject, text_body, html_body)
            except Exception as e:
                logger.error(f"[EmailService] Worker error in send_status_update_email: {e}")

        threading.Thread(target=_worker, daemon=True).start()


email_service = EmailService()
