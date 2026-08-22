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


def is_rit_email(email: str) -> bool:
    """Check if the provided email belongs to an allowed RIT domain."""
    if not email or "@" not in email:
        return False
    domain = email.strip().split("@")[-1].lower()
    return any(domain == d or domain.endswith("." + d) for d in ALLOWED_RIT_DOMAINS)


def generate_otp() -> str:
    """Generate a random 6-digit OTP code."""
    return f"{random.randint(100000, 999999)}"


def send_email_via_smtp(to_email: str, code: str) -> bool:
    """Send HTML verification email via SMTP if credentials are configured."""
    host = getattr(settings, "SMTP_HOST", "smtp.gmail.com") or "smtp.gmail.com"
    port = getattr(settings, "SMTP_PORT", 587) or 587
    user = getattr(settings, "SMTP_USER", "divagar.240075@aids.ritchennai.edu.in") or "divagar.240075@aids.ritchennai.edu.in"
    pwd = getattr(settings, "SMTP_PASSWORD", "eprzscarycrjwnda") or "eprzscarycrjwnda"
    from_email = getattr(settings, "EMAILS_FROM_EMAIL", "divagar.240075@aids.ritchennai.edu.in") or user

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{code} is your QLex RIT Student Verification Code"
        msg["From"] = f"QLex Printing Portal <{from_email}>"
        msg["To"] = to_email

        text_content = f"Your QLex RIT Student Verification Code is: {code}\nThis code expires in 5 minutes."
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <h2 style="color: #0284c7; text-align: center; margin-top: 0;">QLex Printing Portal</h2>
            <p style="font-size: 15px; color: #1e293b;">Hello RIT Student,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">Use the following 6-digit OTP code to verify your RIT email address and complete your account registration:</p>
            <div style="text-align: center; margin: 28px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284c7; background: #f0f9ff; padding: 14px 28px; border-radius: 12px; border: 1px solid #bae6fd; display: inline-block;">
                    {code}
                </span>
            </div>
            <p style="font-size: 13px; color: #64748b;">This code is valid for 5 minutes. If you did not request this, please ignore this message.</p>
        </div>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(host, int(port), timeout=10)
        server.starttls()
        server.login(user, pwd)
        server.sendmail(from_email, [to_email], msg.as_string())
        server.quit()
        logger.info(f"[RIT OTP Service] Successfully sent OTP email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[RIT OTP Service] Failed to send SMTP email to {to_email}: {e}")
        print(f"[RIT OTP Service Error] {e}")
        return False


def send_otp(email: str) -> str:
    """
    Validates RIT domain, generates an OTP, stores it with 5-min expiry,
    attempts sending email via SMTP, and returns/logs the OTP.
    """
    clean_email = email.strip().lower()
    if not is_rit_email(clean_email):
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
