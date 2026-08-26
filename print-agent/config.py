import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / ".env")

# QLex Backend API Settings
BACKEND_URL = os.getenv("QLEX_BACKEND_URL", "https://qlex-backend-ybnb435gbq-el.a.run.app")
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "3"))

# Print Agent Security Key & Shop Identification
API_SECRET_KEY = os.getenv("PRINT_AGENT_SECRET_KEY", "qlex-print-agent-secret")
SHOP_NAME = os.getenv("SHOP_NAME", "QLex Satellite Print Hub")

# Storage directory for downloaded temp PDFs
TEMP_DIR = BASE_DIR / "temp_downloads"
TEMP_DIR.mkdir(exist_ok=True)

# SumatraPDF Portable Executable Path (Windows silent PDF renderer)
SUMATRA_PATH = BASE_DIR / "tools" / "SumatraPDF.exe"

# Preferred Printers Configuration (If empty, auto-detects all OS printers)
# Example: PRINTER_POOL = ["HP LaserJet Pro", "Epson L3150 Series", "Canon iR2006"]
PRINTER_POOL_ENV = os.getenv("PRINTER_POOL", "")
PRINTER_POOL = [p.strip() for p in PRINTER_POOL_ENV.split(",") if p.strip()]

# Mock Print Mode (Set to True for testing without physical paper output)
MOCK_PRINT = os.getenv("MOCK_PRINT", "false").lower() in ("true", "1", "yes")
