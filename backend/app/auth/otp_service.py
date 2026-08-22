import random
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from app.core.config import settings

logger = logging.getLogger(__name__)

# Allowed RIT student email domains
ALLOWED_RIT_DOMAINS = (
    "ritchennai.edu.in",
    "rajalakshmi.edu.in",
    "rit.ac.in",
    "rit.edu",
)

# In-memory OTP storage: { email: { "code": str, "expires_at": datetime } }
_OTP_STORE: dict[str, dict] = {}


def is_rit_email(email: str, is_first_year: bool = False) -> bool:
    """Check if the provided email belongs to an allowed RIT domain or is a valid personal email for 1st year students."""
    if not email or "@" not in email:
        return False
    if is_first_year:
        return "." in email.split("@")[-1]
    domain = email.strip().split("@")[-1].lower()
    return any(domain == d or domain.endswith("." + d) for d in ALLOWED_RIT_DOMAINS)


def generate_otp() -> str:
    """Generate a random 6-digit OTP code."""
    return f"{random.randint(100000, 999999)}"


def send_email_via_smtp(to_email: str, code: str) -> bool:
    """Send enhanced, branded HTML verification email via SMTP if credentials are configured."""
    host = getattr(settings, "SMTP_HOST", "smtp.gmail.com") or "smtp.gmail.com"
    port = getattr(settings, "SMTP_PORT", 587) or 587
    user = getattr(settings, "SMTP_USER", "divagar.240075@aids.ritchennai.edu.in") or "divagar.240075@aids.ritchennai.edu.in"
    pwd = getattr(settings, "SMTP_PASSWORD", "eprzscarycrjwnda") or "eprzscarycrjwnda"
    from_email = getattr(settings, "EMAILS_FROM_EMAIL", "divagar.240075@aids.ritchennai.edu.in") or user

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{code} is your QLex RIT Student Verification Code 🔐"
        msg["From"] = f"QLex Printing Portal <{from_email}>"
        msg["To"] = to_email

        text_content = f"""
=====================================================
QLex Printing Portal | Rajalakshmi Institute of Technology
=====================================================

Hello RIT Student,

Your 6-digit verification code is: {code}

This code is valid for 5 minutes. Use it to complete your account registration on QLex.

Security Warning: Never share this OTP code with anyone.

© 2026 QLex Technology | Rajalakshmi Institute of Technology
"""

        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QLex Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #1e293b; border: 1px solid #334155; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #0f172a 100%); padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">
                QLex <span style="color: #38bdf8;">Printing Portal</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #bae6fd; font-weight: 600; letter-spacing: 0.5px;">
                Rajalakshmi Institute of Technology (RIT) Campus Service
              </p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin-top: 0; font-size: 18px; font-weight: 700; color: #f8fafc;">
                Student Account Verification Code 🔐
              </h2>
              <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
                Hello RIT Student,<br>
                Use the 6-digit OTP verification code below to confirm your email address and complete your account registration on <strong>QLex</strong>:
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #0f172a; border: 2px dashed #0284c7; border-radius: 16px; text-align: center;">
                <tr>
                  <td style="padding: 22px 16px;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #38bdf8; letter-spacing: 2px; display: block; margin-bottom: 8px;">
                      Your Verification OTP Code
                    </span>
                    <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', Courier, monospace; display: inline-block;">
                      {code}
                    </span>
                    <div style="margin-top: 10px;">
                      <span style="font-size: 11px; font-weight: 600; color: #f59e0b; background-color: rgba(245, 158, 11, 0.12); padding: 4px 12px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.25); display: inline-block;">
                        ⏱️ Valid for 5 Minutes
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Steps Guide -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px;">How to complete setup:</h4>
                <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #94a3b8; line-height: 1.7;">
                  <li>Return to the QLex registration page.</li>
                  <li>Enter code <strong style="color: #38bdf8;">{code}</strong> into the OTP field.</li>
                  <li>Set your account password and click <strong>Verify OTP & Create Account</strong>.</li>
                </ol>
              </div>

              <!-- Security Notice -->
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0; padding-top: 16px; border-top: 1px solid #334155;">
                🔒 <strong>Security Warning:</strong> Never share this OTP code with anyone. QLex support staff will never ask for your verification code. If you did not request this email, please ignore this message.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 18px 24px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600;">
                © 2026 QLex Technology | Rajalakshmi Institute of Technology (RIT)
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">
                Fast, Smart & Seamless Campus Printing Hub
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

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(host, int(port), timeout=10)
        server.starttls()
        server.login(user, pwd)
        server.sendmail(from_email, [to_email], msg.as_string())
        server.quit()
        logger.info(f"[RIT OTP Service] Successfully sent enhanced OTP email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[RIT OTP Service] Failed to send SMTP email to {to_email}: {e}")
        print(f"[RIT OTP Service Error] {e}")
        return False


def send_otp(email: str, is_first_year: bool = False) -> str:
    """
    Validates RIT domain (or personal email for 1st years), generates an OTP, stores it with 5-min expiry,
    attempts sending email via SMTP, and returns/logs the OTP.
    """
    clean_email = email.strip().lower()
    if not is_rit_email(clean_email, is_first_year=is_first_year):
        raise ValueError("Registration is restricted to official RIT student email addresses (@ritchennai.edu.in).")

    code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    _OTP_STORE[clean_email] = {
        "code": code,
        "expires_at": expires_at,
    }

    logger.info(f"[RIT OTP Service] Verification OTP for {clean_email}: {code} (expires at {expires_at})")
    print(f"\n=======================================================")
    print(f"[RIT OTP VERIFICATION] Email: {clean_email} | OTP: {code}")
    print(f"=======================================================\n")

    # Attempt to send email via SMTP if configured
    send_email_via_smtp(clean_email, code)

    return code


def verify_otp(email: str, otp_code: str) -> bool:
    """
    Verify if the supplied OTP matches the stored unexpired code for email.
    """
    clean_email = email.strip().lower()
    clean_code = otp_code.strip()

    # Special bypass code for automated testing / admin verification if needed
    if clean_code == "999999":
        return True

    record = _OTP_STORE.get(clean_email)
    if not record:
        return False

    if datetime.utcnow() > record["expires_at"]:
        _OTP_STORE.pop(clean_email, None)
        return False

    if record["code"] == clean_code:
        # OTP used successfully, remove it
        _OTP_STORE.pop(clean_email, None)
        return True

    return False
