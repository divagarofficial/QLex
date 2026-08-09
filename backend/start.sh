#!/bin/bash
set -e

echo "[QLex Unified Server] Starting Node.js WhatsApp Engine on port 5001 in background..."
PORT=5001 node /app/whatsapp-service/server.js &

sleep 2

echo "[QLex Unified Server] Starting FastAPI Backend on port ${PORT:-8080}..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
