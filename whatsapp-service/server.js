const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Global middleware for localtunnel bypass and CORS
app.use((req, res, next) => {
  res.setHeader("Bypass-Tunnel-Reminder", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

const PORT = process.env.WHATSAPP_PORT || (process.env.PORT && process.env.PORT !== "8080" ? process.env.PORT : 5001);

// Absolute path to auth folder to prevent directory mismatch issue
const AUTH_DIR = path.resolve(__dirname, "./.wwebjs_auth");

// 1. Health & Keep-Alive Endpoints
app.get("/health", (req, res) => res.json({ status: "healthy", service: "whatsapp-bot" }));
app.get("/ping", (req, res) => res.status(200).send("pong"));

// 2. Global Bot State
let botStatus = "INITIALIZING"; // INITIALIZING, QR_READY, AUTHENTICATED, READY, DISCONNECTED
let currentQrCodeDataUrl = null;
let clientInfo = null;
let heartbeatInterval = null;
let authFailureCount = 0;
let isReinitializing = false;

function removeChromeLocks(dir) {
  if (!fs.existsSync(dir)) return;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          removeChromeLocks(fullPath);
        } else if (
          file.startsWith("Singleton") ||
          file.endsWith(".lock") ||
          file === "lockfile" ||
          file === "LOCK" ||
          file === "Preferences.tmp"
        ) {
          fs.unlinkSync(fullPath);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

function wipeSessionData() {
  try {
    removeChromeLocks(AUTH_DIR);
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log("[WhatsApp Bot] Session directory wiped successfully.");
    }
  } catch (e) {
    console.error("[WhatsApp Bot] Failed to wipe session folder:", e.message);
  }
}

function createClient() {
  removeChromeLocks(AUTH_DIR);
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-gpu",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-session-crashed-bubble",
    "--disable-infobars",
    "--restore-last-session",
    "--disable-blink-features=AutomationControlled",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-breakpad",
    "--disable-component-extensions-with-background-pages",
    "--disable-ipc-flooding-protection",
    "--enable-features=NetworkService,NetworkServiceInProcess",
    "--force-color-profile=srgb",
    "--metrics-recording-only",
    "--mute-audio",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
  ];

  const puppeteerOpts = {
    headless: true,
    args,
    handleSIGINT: false,
    handleSIGTERM: false,
    handleSIGHUP: false
  };
  if (fs.existsSync("/usr/bin/chromium")) {
    puppeteerOpts.executablePath = "/usr/bin/chromium";
  } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    puppeteerOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  return new Client({
    authStrategy: new LocalAuth({ clientId: "qlex-bot-session", dataPath: AUTH_DIR }),
    takeoverOnConflict: true,
    qrMaxRetries: 15,
    puppeteer: puppeteerOpts
  });
}

let client = createClient();

let heartbeatFailures = 0;

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatFailures = 0;
  heartbeatInterval = setInterval(async () => {
    if (botStatus !== "READY" || !client) return;
    try {
      const state = await client.getState();
      if (state === "CONNECTED") {
        heartbeatFailures = 0;
      } else if (state && state !== "CONNECTED") {
        heartbeatFailures++;
        console.warn(`[WhatsApp Bot Heartbeat] Connection state is ${state} (${heartbeatFailures}/3)`);
        if (heartbeatFailures >= 3) {
          console.warn("[WhatsApp Bot Heartbeat] 3 consecutive non-CONNECTED states. Reconnecting...");
          heartbeatFailures = 0;
          reconnectClient(false);
        }
      }
    } catch (err) {
      heartbeatFailures++;
      console.warn(`[WhatsApp Bot Heartbeat] Ping failed (${err.message || err}). (${heartbeatFailures}/3)`);
      if (heartbeatFailures >= 3) {
        console.warn("[WhatsApp Bot Heartbeat] 3 consecutive ping failures. Attempting soft recovery...");
        heartbeatFailures = 0;
        reconnectClient(false);
      }
    }
  }, 60000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function reconnectClient(wipeSession = false) {
  if (isReinitializing) return;
  isReinitializing = true;
  stopHeartbeat();
  botStatus = "INITIALIZING";
  currentQrCodeDataUrl = null;
  clientInfo = null;

  console.log(`[WhatsApp Bot] Reconnecting engine (wipeSession=${wipeSession})...`);
  setTimeout(async () => {
    try {
      if (client) {
        try { await client.destroy(); } catch (e) {}
      }
      if (wipeSession) {
        wipeSessionData();
      } else {
        removeChromeLocks(AUTH_DIR);
      }
      client = createClient();
      bindClientEvents(client);
      initBot();
    } catch (e) {
      console.error("[WhatsApp Bot] Re-init error:", e);
    } finally {
      isReinitializing = false;
    }
  }, 2000);
}

function bindClientEvents(cli) {
  cli.on("qr", async (qr) => {
    console.log("[WhatsApp Bot] New QR Code generated.");
    botStatus = "QR_READY";
    try {
      currentQrCodeDataUrl = await QRCode.toDataURL(qr);
    } catch (err) {
      console.error("[WhatsApp Bot] Error rendering QR Code:", err);
    }
  });

  cli.on("authenticated", () => {
    console.log("[WhatsApp Bot] Authenticated successfully!");
    botStatus = "AUTHENTICATED";
    authFailureCount = 0;
    currentQrCodeDataUrl = null;
  });

  cli.on("auth_failure", (msg) => {
    console.error("[WhatsApp Bot] Auth Delay / Initialization Warning:", msg);
    authFailureCount++;
    console.log(`[WhatsApp Bot] Preserving session credentials. Retrying connection (${authFailureCount})...`);
    setTimeout(() => {
      reconnectClient(false);
    }, 3000);
  });

  cli.on("ready", () => {
    console.log("[WhatsApp Bot] Client is READY & Connected to WhatsApp!");
    botStatus = "READY";
    authFailureCount = 0;
    currentQrCodeDataUrl = null;
    clientInfo = cli.info ? { wid: cli.info.wid.user, pushname: cli.info.pushname } : null;
    startHeartbeat();
  });

  cli.on("disconnected", (reason) => {
    console.log("[WhatsApp Bot] Disconnected event triggered. Reason:", reason);
    stopHeartbeat();
    const isExplicitLogout = reason === "LOGOUT" || reason === "UNPAIRED" || reason === "UNPAIRED_IDLE";
    if (isExplicitLogout) {
      console.log("[WhatsApp Bot] Device explicitly unlinked/logged out from phone. Wiping session...");
      reconnectClient(true);
    } else {
      console.log("[WhatsApp Bot] Temporary network/socket disconnect. Reconnecting with existing session...");
      reconnectClient(false);
    }
  });
}

bindClientEvents(client);

// Safe Initialization
function initBot() {
  botStatus = "INITIALIZING";
  console.log("[WhatsApp Bot] Launching WhatsApp Web Engine...");
  client.initialize()
    .then(() => console.log("[WhatsApp Bot] Engine initialization promise resolved successfully."))
    .catch((err) => {
      console.error("[WhatsApp Bot] Init Error:", err ? (err.stack || err.message || err) : err);
      botStatus = "DISCONNECTED";
      setTimeout(() => {
        if (botStatus === "DISCONNECTED" && !isReinitializing) {
          reconnectClient(false);
        }
      }, 5000);
    });
}

initBot();

// 4. REST Endpoints

// GET /status
app.get("/status", (req, res) => {
  return res.json({
    success: true,
    status: botStatus,
    info: clientInfo,
    timestamp: new Date().toISOString()
  });
});

// GET /qr
app.get("/qr", (req, res) => {
  return res.json({
    success: true,
    status: botStatus,
    qr: currentQrCodeDataUrl
  });
});

// Background Message Queue Processor for 10ms Instant HTTP Responses
const sendQueue = [];
let isProcessingQueue = false;

async function processSendQueue() {
  if (isProcessingQueue || sendQueue.length === 0) return;
  isProcessingQueue = true;

  while (sendQueue.length > 0) {
    const item = sendQueue.shift();
    const { chatId, message, pdfPath, mediaBase64, filename, cleanPhone } = item;
    try {
      if (pdfPath && fs.existsSync(pdfPath)) {
        const media = MessageMedia.fromFilePath(pdfPath);
        await client.sendMessage(chatId, media, { caption: message });
      } else if (mediaBase64 && filename) {
        const media = new MessageMedia("application/pdf", mediaBase64, filename);
        await client.sendMessage(chatId, media, { caption: message });
      } else {
        await client.sendMessage(chatId, message);
      }
      console.log(`[WhatsApp Bot] Successfully dispatched message to ${cleanPhone}`);
    } catch (err) {
      console.error(`[WhatsApp Bot] Error sending message to ${cleanPhone}:`, err.message || err);
    }
  }

  isProcessingQueue = false;
}

// Deduplication cache: phone + message snippet -> timestamp
const recentSentMap = new Map();

// POST /send
app.post("/send", (req, res) => {
  try {
    const { phone, message, pdfPath, mediaBase64, filename } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ success: false, error: "Phone and message are required." });
    }

    if (botStatus !== "READY") {
      return res.status(503).json({ success: false, error: `Bot not ready (Status: ${botStatus})`, status: botStatus });
    }

    let cleanPhone = phone.toString().replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    const chatId = `${cleanPhone}@c.us`;

    // 30-second deduplication filter for identical messages
    const msgSnippet = String(message).slice(0, 80);
    const dedupKey = `${cleanPhone}:${msgSnippet}`;
    const now = Date.now();
    if (recentSentMap.has(dedupKey) && (now - recentSentMap.get(dedupKey)) < 30000) {
      console.log(`[WhatsApp Bot] Suppressed duplicate message request to ${cleanPhone}`);
      return res.json({ success: true, status: "SKIPPED_DUPLICATE", message: `Duplicate message suppressed for ${cleanPhone}` });
    }
    recentSentMap.set(dedupKey, now);
    if (recentSentMap.size > 500) {
      for (const [k, t] of recentSentMap.entries()) {
        if (now - t > 60000) recentSentMap.delete(k);
      }
    }

    sendQueue.push({ chatId, message, pdfPath, mediaBase64, filename, cleanPhone });
    processSendQueue();

    return res.json({ success: true, status: "QUEUED", message: `Message queued for ${cleanPhone}` });
  } catch (err) {
    console.error("[WhatsApp Bot] Error queueing message:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to send message" });
  }
});

// POST /logout & /reset
app.post(["/logout", "/reset"], async (req, res) => {
  try {
    console.log("[WhatsApp Bot] Manual Session Reset / Logout requested.");
    stopHeartbeat();
    botStatus = "DISCONNECTED";
    currentQrCodeDataUrl = null;
    clientInfo = null;
    if (client) {
      try { await client.logout(); } catch (e) {}
      try { await client.destroy(); } catch (e) {}
    }
    wipeSessionData();
    client = createClient();
    bindClientEvents(client);
    initBot();
    return res.json({ success: true, message: "Session wiped cleanly. Fresh QR code generating..." });
  } catch (err) {
    console.error("[WhatsApp Bot] Error resetting session:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to reset session" });
  }
});

// GET / - Pairing Page
app.get(["/", "/qr-page"], (req, res) => {
  return res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QLex WhatsApp Bot Pairing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b141a; color: #e9edef; text-align: center; padding: 40px 20px; margin: 0; }
          .card { max-width: 440px; margin: 0 auto; background: #111b21; border: 1px solid #222d34; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; }
          h1 { font-size: 22px; margin-bottom: 8px; color: #00a884; }
          p { font-size: 14px; color: #8696a0; line-height: 1.5; }
          .qr-box { background: #ffffff; padding: 16px; border-radius: 12px; display: inline-block; margin: 20px 0; min-width: 250px; min-height: 250px; }
          img { width: 250px; height: 250px; display: block; border-radius: 4px; }
          .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; background: #202c33; color: #00a884; margin-bottom: 15px; }
          .btn-reset { display: inline-block; margin-top: 15px; background: #ea4335; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
          .btn-reset:hover { background: #d93025; }
          .connected-icon { font-size: 64px; margin-bottom: 10px; }
          .spinner { border: 4px solid #222d34; border-top: 4px solid #00a884; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 60px auto 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card" id="main-card">
          <h1>QLex WhatsApp Bot</h1>
          <div class="status-badge" id="status-badge">Checking status...</div>
          
          <div id="content-box">
            <p>Open WhatsApp on phone &rarr; <strong>Linked Devices</strong> &rarr; <strong>Link a Device</strong></p>
            <div class="qr-box">
              <img id="qr-img" src="${currentQrCodeDataUrl || ''}" style="${currentQrCodeDataUrl ? 'display:block;' : 'display:none;'}" alt="WhatsApp QR Code" />
              <div id="loading-spinner" style="${currentQrCodeDataUrl ? 'display:none;' : 'display:block;'}">
                <div class="spinner"></div>
                <p style="color:#111; font-weight:bold; font-size:13px; margin-top:10px;">Generating QR Code...</p>
              </div>
            </div>
            <p style="font-size:12px; color:#667781;">Page stays static &mdash; scan whenever ready!</p>
          </div>

          <div style="margin-top: 20px; border-top: 1px solid #222d34; padding-top: 15px;">
            <button class="btn-reset" onclick="resetSession()">🔄 Reset & Link New Device</button>
          </div>
        </div>

        <script>
          async function resetSession() {
            if (!confirm("Are you sure you want to reset the WhatsApp session? This will generate a fresh QR code.")) return;
            const badge = document.getElementById('status-badge');
            const content = document.getElementById('content-box');
            badge.innerText = 'Resetting Session...';
            badge.style.color = '#ea4335';
            if (content) {
              content.innerHTML = '<div class="spinner"></div><p style="color:#8696a0;">Wiping session keys & starting fresh engine...</p>';
            }
            try {
              const basePath = window.location.pathname.includes('/admin/whatsapp') ? '/admin/whatsapp' : '';
              await fetch(basePath + '/logout', { method: 'POST' });
              setTimeout(pollStatus, 1500);
            } catch (e) {
              alert('Error resetting session: ' + e.message);
            }
          }

          async function pollStatus() {
            try {
              const basePath = window.location.pathname.includes('/admin/whatsapp') ? '/admin/whatsapp' : '';
              const res = await fetch(basePath + '/status');
              const data = await res.json();
              const badge = document.getElementById('status-badge');
              const card = document.getElementById('main-card');
              const content = document.getElementById('content-box');
              
              if (data.status === 'READY') {
                const connName = (data.info && (data.info.pushname || data.info.wid)) ? (data.info.pushname || data.info.wid) : 'WhatsApp Web';
                card.innerHTML = '<div class="connected-icon">✅</div>' +
                  '<h1 style="color:#00a884;">WhatsApp Connected!</h1>' +
                  '<p style="color:#e9edef; font-weight:bold; margin-top:10px;">Status: READY 🟢</p>' +
                  '<p style="color:#8696a0;">Connected Account: ' + connName + '</p>' +
                  '<p style="font-size:12px; color:#00a884; margin-top:20px;">Your QLex print receipts & updates will now send automatically 24/7!</p>' +
                  '<div style="margin-top: 25px; border-top: 1px solid #222d34; padding-top: 15px;">' +
                  '<button class="btn-reset" onclick="resetSession()">🔴 Disconnect & Unlink Device</button>' +
                  '</div>';
                return;
              } else if (data.status === 'AUTHENTICATED') {
                badge.innerText = 'Finishing Authentication...';
                badge.style.color = '#34b7f1';
                if (content && !content.innerHTML.includes('Syncing chats')) {
                  content.innerHTML = '<div class="spinner"></div><p style="color:#e9edef; font-weight:bold;">Authenticated! Syncing chats & session tokens...</p>';
                }
              } else if (data.status === 'QR_READY') {
                badge.innerText = 'Scan QR Code to Link Device';
                badge.style.color = '#f7a600';

                // Restore QR DOM elements if content-box was overwritten during DISCONNECTED state
                let qrImg = document.getElementById('qr-img');
                if (!qrImg && content) {
                  content.innerHTML = '<p>Open WhatsApp on phone &rarr; <strong>Linked Devices</strong> &rarr; <strong>Link a Device</strong></p>' +
                    '<div class="qr-box">' +
                    '  <img id="qr-img" src="" style="display:none;" alt="WhatsApp QR Code" />' +
                    '  <div id="loading-spinner" style="display:block;">' +
                    '    <div class="spinner"></div>' +
                    '    <p style="color:#111; font-weight:bold; font-size:13px; margin-top:10px;">Rendering QR Code...</p>' +
                    '  </div>' +
                    '</div>' +
                    '<p style="font-size:12px; color:#667781;">Page stays static &mdash; scan whenever ready!</p>';
                  qrImg = document.getElementById('qr-img');
                }

                const qrRes = await fetch(basePath + '/qr');
                const qrData = await qrRes.json();
                const spinner = document.getElementById('loading-spinner');
                if (qrData.qr && qrImg) {
                  if (qrImg.src !== qrData.qr) {
                    qrImg.src = qrData.qr;
                  }
                  qrImg.style.display = 'block';
                  if (spinner) spinner.style.display = 'none';
                }
              } else if (data.status === 'DISCONNECTED') {
                badge.innerText = 'Status: DISCONNECTED';
                badge.style.color = '#ea4335';
                if (content && !content.innerHTML.includes('WhatsApp Disconnected')) {
                  content.innerHTML = '<div style="font-size:48px; margin:20px 0;">⚠️</div>' +
                    '<p style="color:#ea4335; font-weight:bold;">WhatsApp Disconnected or Session Expired.</p>' +
                    '<p style="color:#8696a0; font-size:13px;">Click the button below to generate a fresh QR Code.</p>';
                }
              } else {
                badge.innerText = 'Status: ' + (data.status || 'INITIALIZING');
                badge.style.color = '#8696a0';
              }
            } catch (e) {}
          }

          pollStatus();
          setInterval(pollStatus, 2500);
        </script>
      </body>
    </html>
  `);
});

// Start Express HTTP Server
app.listen(PORT, () => {
  console.log(`[WhatsApp Bot Microservice] Running locally on http://localhost:${PORT}`);
});

// Graceful process exit cleanup to preserve session files cleanly
const handleShutdown = async (signal) => {
  console.log(`[WhatsApp Bot] Signal ${signal} received. Safely closing browser and preserving session...`);
  try {
    if (client) {
      await client.destroy();
    }
  } catch (e) {}
  process.exit(0);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
