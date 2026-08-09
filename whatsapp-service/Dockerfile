FROM node:18-slim

# Install Chromium and system libraries required for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    libharfbuzz0b \
    ca-certificates \
    fonts-freefont-ttf \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use installed Chromium binary instead of downloading bundled Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=8080
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose default Cloud Run port
EXPOSE 8080

CMD ["node", "server.js"]
