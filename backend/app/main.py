from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.auth.router import router as auth_router
from app.common.exception_handlers import register_exception_handlers
from app.core.config import settings
from app.orders.router import router as order_router
from app.payments.router import (
    router as payment_router,
)
from app.shop.router import router as shop_router
from app.settlements.router import (
    router as settlement_router,
)
from app.pricing.router import (
    router as pricing_router,
)
from app.waiting_room.router import (
    router as waiting_room_router,
)
from app.student.router import (
    router as student_router,
)

from app.admin.router import router as admin_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# Setup persistent uploads directory (supports Hugging Face /data volume or Vercel /tmp)
if os.path.exists("/data"):
    uploads_dir = "/data/uploads"
elif os.path.exists("/tmp"):
    uploads_dir = "/tmp/uploads"
else:
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

try:
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
except Exception as e:
    print(f"Warning: Could not mount uploads directory: {e}")

register_exception_handlers(app)

# CORS — allow origins from environment variable + dev defaults
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://192.168.27.188:3000",
    "http://192.168.244.18:3000",
]
allowed_origins = list(set(default_origins + custom_origins)) if "*" not in raw_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(order_router)
app.include_router(
    payment_router
)
app.include_router(shop_router)
app.include_router(
    settlement_router
)
app.include_router(
    pricing_router
)
app.include_router(
    waiting_room_router
)
app.include_router(
    student_router
)
app.include_router(admin_router)


import asyncio
import subprocess
import requests
from app.db.database import SessionLocal
from app.settlements.repository import SettlementRepository

def ensure_whatsapp_bot_running():
    """Checks if WhatsApp microservice is running on port 5001, auto-spawns it if offline."""
    try:
        res = requests.get("http://localhost:5001/status", timeout=2)
        if res.status_code == 200:
            return
    except Exception:
        pass

    try:
        service_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "whatsapp-service"))
        server_file = os.path.join(service_dir, "server.js")
        if os.path.exists(server_file):
            print("[WhatsApp Bot Manager] WhatsApp bot offline. Auto-spawning background service on port 5001...")
            creation_flags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            subprocess.Popen(
                ["node", "server.js"],
                cwd=service_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=creation_flags
            )
            print("[WhatsApp Bot Manager] Successfully auto-launched whatsapp-service background daemon.")
    except Exception as e:
        print(f"[WhatsApp Bot Manager] Failed to auto-launch whatsapp-service: {e}")

async def whatsapp_bot_health_monitor():
    """Background loop keeping WhatsApp bot microservice alive and healthy."""
    while True:
        try:
            ensure_whatsapp_bot_running()
        except Exception as e:
            print(f"[WhatsApp Bot Health] Monitor error: {e}")
        await asyncio.sleep(30)

async def auto_settlement_scheduler():
    """Background loop running every 30 minutes to auto-generate & sync daily settlements."""
    while True:
        try:
            db = SessionLocal()
            try:
                repo = SettlementRepository(db)
                repo.sync_settlements("RIT_PRINT_SHOP")
            finally:
                db.close()
        except Exception as e:
            print(f"[AutoSettlement] Background sync error: {e}")
        await asyncio.sleep(1800)

@app.on_event("startup")
async def startup_event():
    ensure_whatsapp_bot_running()
    asyncio.create_task(auto_settlement_scheduler())
    asyncio.create_task(whatsapp_bot_health_monitor())

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to QLex API 🚀",
    }