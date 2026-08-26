from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
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
from app.utils.file_storage import find_uploaded_file, generate_fallback_pdf

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

@app.get("/uploads/{file_path:path}")
async def serve_upload_file(file_path: str):
    found_file = find_uploaded_file(file_path)
    if found_file:
        return FileResponse(path=str(found_file))
    
    filename = os.path.basename(file_path)
    pdf_bytes = generate_fallback_pdf(filename)
    return Response(content=pdf_bytes, media_type="application/pdf")

register_exception_handlers(app)

# Intercept all HTTP requests for 100% universal CORS support across Web and Mobile (Android/Capacitor)
@app.middleware("http")
async def universal_cors_middleware(request, call_next):
    origin = request.headers.get("origin")
    if request.method == "OPTIONS":
        response = Response(status_code=200, content="OK")
        response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Waiting-Room-Session"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    try:
        response = await call_next(request)
    except Exception as exc:
        from fastapi import HTTPException
        from fastapi.responses import JSONResponse
        from app.common.exceptions import QLexException

        if isinstance(exc, HTTPException):
            status_code = exc.status_code
            detail = exc.detail
        elif isinstance(exc, (ValueError, QLexException)):
            status_code = 400
            detail = str(exc)
        else:
            import logging
            logging.getLogger(__name__).error(f"[Unhandled Exception] {request.url.path}: {exc}", exc_info=True)
            status_code = 500
            detail = str(exc)

        response = JSONResponse(
            status_code=status_code,
            content={"detail": detail, "message": str(detail), "success": False}
        )

    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@app.on_event("startup")
def auto_migrate_and_seed():
    try:
        from app.db.database import init_db_tables
        init_db_tables()
        print("[Startup] Database initialized and seeded cleanly.")
    except Exception as err:
        print(f"[Startup Warning] Table auto-creation failed: {err}")

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

import shutil

def ensure_whatsapp_bot_running() -> bool:
    """Checks if WhatsApp microservice is running on port 5001, auto-spawns it if offline."""
    if os.getenv("VERCEL") or os.getenv("DISABLE_LOCAL_BOT"):
        return False
    
    bot_url = (os.getenv("WHATSAPP_BOT_URL", "") or "http://127.0.0.1:5001").rstrip("/")
    try:
        res = requests.get(f"{bot_url}/status", timeout=2)
        if res.status_code == 200:
            return True
    except Exception:
        pass

    try:
        # Search candidate paths for whatsapp-service server.js
        base_dir = os.path.dirname(os.path.abspath(__file__))
        candidate_paths = [
            "/app/whatsapp-service/server.js",
            os.path.abspath(os.path.join(base_dir, "..", "whatsapp-service", "server.js")),
            os.path.abspath(os.path.join(base_dir, "..", "..", "whatsapp-service", "server.js"))
        ]
        
        server_file = None
        service_dir = None
        for path in candidate_paths:
            if os.path.exists(path):
                server_file = path
                service_dir = os.path.dirname(path)
                break

        node_cmd = shutil.which("node") or "node"
        if server_file and service_dir:
            print(f"[WhatsApp Bot Manager] WhatsApp bot offline at {bot_url}. Auto-spawning service from {server_file}...")
            creation_flags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            env = os.environ.copy()
            env["PORT"] = "5001"
            subprocess.Popen(
                [node_cmd, "server.js"],
                cwd=service_dir,
                env=env,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=creation_flags
            )
            print("[WhatsApp Bot Manager] Successfully auto-launched whatsapp-service background daemon.")
            return True
    except Exception as e:
        print(f"[WhatsApp Bot Manager] Failed to auto-launch whatsapp-service: {e}")
    return False

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

def ensure_db_schema_synced():
    """Auto-sync database schema changes on container startup."""
    try:
        from sqlalchemy import text
        from app.db.database import SessionLocal
        db = SessionLocal()
        try:
            db.execute(text("ALTER TABLE shop_queue ADD COLUMN IF NOT EXISTS assigned_printer VARCHAR(100);"))
            db.commit()
            print("[DB Schema] Successfully verified/synced assigned_printer column in shop_queue table.")
        except Exception as e:
            db.rollback()
            print(f"[DB Schema] Column auto-sync warning: {e}")
        finally:
            db.close()
    except Exception as e:
        print(f"[DB Schema] Startup auto-sync error: {e}")

@app.on_event("startup")
async def startup_event():
    ensure_db_schema_synced()
    if not os.getenv("VERCEL"):
        ensure_whatsapp_bot_running()
        asyncio.create_task(whatsapp_bot_health_monitor())
    asyncio.create_task(auto_settlement_scheduler())

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to QLex API 🚀",
    }

@app.get("/health")
def health_check():
    """Liveness & Readiness probe endpoint for Google Cloud Run."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }