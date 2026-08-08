FROM node:18-slim

# Install Chromium and system libraries required for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use installed Chromium binary instead of downloading bundled Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=7860

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose Hugging Face default port
EXPOSE 7860

CMD ["node", "server.js"]
