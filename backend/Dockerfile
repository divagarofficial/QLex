FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Configure Puppeteer & Chromium environment for Linux
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV WHATSAPP_BOT_URL=http://127.0.0.1:5001

WORKDIR /app

# Install system dependencies, Node.js 20, and Chromium browser for Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    gnupg \
    chromium \
    chromium-sandbox \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Node.js dependencies for whatsapp-service
COPY whatsapp-service /app/whatsapp-service
RUN cd /app/whatsapp-service && npm install --production

# Install Python dependencies for FastAPI backend
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and entrypoint
COPY . .
RUN mkdir -p /app/uploads && chmod +x /app/start.sh

# Default port for Google Cloud Run
EXPOSE 8080

# Launch both Node.js WhatsApp Microservice and FastAPI backend
CMD ["/bin/bash", "/app/start.sh"]
