#!/bin/bash
set -e

(
  while true; do
    echo "[QLex Unified Server] Starting Node.js WhatsApp Engine on port 5001..."
    PORT=5001 node /app/whatsapp-service/server.js || true
    echo "[QLex Unified Server] Node.js WhatsApp Engine exited. Restarting in 3 seconds..."
    sleep 3
  done
) &

sleep 2

echo "[QLex Unified Server] Starting FastAPI Backend on port ${PORT:-8080}..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
