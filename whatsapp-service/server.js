const fs = require("fs");
const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

const PORT = process.env.PORT || 5001;

// 1. Health & Keep-Alive Endpoints
app.get("/health", (req, res) => res.json({ status: "healthy", service: "whatsapp-bot" }));
app.get("/ping", (req, res) => res.status(200).send("pong"));

// 2. Global Bot State
let botStatus = "INITIALIZING"; // INITIALIZING, QR_READY, AUTHENTICATED, READY, DISCONNECTED
let currentQrCodeDataUrl = null;
let clientInfo = null;

// 3. Low-RAM Puppeteer Configuration for Docker / Render 512MB RAM Cap
function createClient() {
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
    "--js-flags=--max-old-space-size=128",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-renderer-backgrounding",
    "--mute-audio",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  ];

  const puppeteerOpts = { headless: true, args };
  if (fs.existsSync("/usr/bin/chromium")) {
    puppeteerOpts.executablePath = "/usr/bin/chromium";
  } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    puppeteerOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  return new Client({
    authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
    puppeteer: puppeteerOpts
  });
}

let client = createClient();

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
    currentQrCodeDataUrl = null;
  });

  cli.on("auth_failure", (msg) => {
    console.error("[WhatsApp Bot] Auth Failure:", msg);
    botStatus = "DISCONNECTED";
    currentQrCodeDataUrl = null;
  });

  cli.on("ready", () => {
    console.log("[WhatsApp Bot] Client is READY & Connected to WhatsApp!");
    botStatus = "READY";
    currentQrCodeDataUrl = null;
    clientInfo = cli.info ? { wid: cli.info.wid.user, pushname: cli.info.pushname } : null;
  });

  cli.on("disconnected", (reason) => {
    console.log("[WhatsApp Bot] Disconnected:", reason);
    botStatus = "DISCONNECTED";
    currentQrCodeDataUrl = null;
    clientInfo = null;
  });
}

bindClientEvents(client);

// Safe Initialization
function initBot() {
  botStatus = "INITIALIZING";
  console.log("[WhatsApp Bot] Launching WhatsApp Web Engine...");
  client.initialize().catch((err) => {
    console.error("[WhatsApp Bot] Init Error:", err ? err.message : err);
    botStatus = "DISCONNECTED";
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

// POST /send
app.post("/send", async (req, res) => {
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

    // Handle PDF / Media attachment
    if (pdfPath && fs.existsSync(pdfPath)) {
      const media = MessageMedia.fromFilePath(pdfPath);
      await client.sendMessage(chatId, media, { caption: message });
    } else if (mediaBase64 && filename) {
      const media = new MessageMedia("application/pdf", mediaBase64, filename);
      await client.sendMessage(chatId, media, { caption: message });
    } else {
      await client.sendMessage(chatId, message);
    }

    return res.json({ success: true, message: `Message sent to ${cleanPhone}` });
  } catch (err) {
    console.error("[WhatsApp Bot] Error sending message:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to send message" });
  }
});

// GET / - Pairing Page (Zero Browser Reloads)
app.get(["/", "/qr-page"], (req, res) => {
  return res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QLex WhatsApp Bot Pairing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b141a; color: #e9edef; text-align: center; padding: 40px 20px; margin: 0; }
          .card { max-width: 420px; margin: 0 auto; background: #111b21; border: 1px solid #222d34; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h1 { font-size: 22px; margin-bottom: 8px; color: #00a884; }
          p { font-size: 14px; color: #8696a0; line-height: 1.5; }
          .qr-box { background: #ffffff; padding: 16px; border-radius: 12px; display: inline-block; margin: 20px 0; min-width: 250px; min-height: 250px; }
          img { width: 250px; height: 250px; display: block; border-radius: 4px; }
          .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; background: #202c33; color: #00a884; margin-bottom: 15px; }
          .connected-icon { font-size: 64px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="card" id="main-card">
          <h1>QLex WhatsApp Bot</h1>
          <div class="status-badge" id="status-badge">Checking status...</div>
          
          <div id="qr-container">
            <p>Open WhatsApp on phone &rarr; <strong>Linked Devices</strong> &rarr; <strong>Link a Device</strong></p>
            <div class="qr-box">
              <img id="qr-img" src="${currentQrCodeDataUrl || ''}" style="${currentQrCodeDataUrl ? 'display:block;' : 'display:none;'}" alt="WhatsApp QR Code" />
              <div id="loading-spinner" style="${currentQrCodeDataUrl ? 'display:none;' : 'display:block; padding-top:100px; color:#111;'}">Generating QR Code...</div>
            </div>
            <p style="font-size:12px; color:#667781;">Page stays static &mdash; scan whenever ready!</p>
          </div>
        </div>

        <script>
          async function pollStatus() {
            try {
              const res = await fetch('/status');
              const data = await res.json();
              const badge = document.getElementById('status-badge');
              const card = document.getElementById('main-card');
              
              if (data.status === 'READY') {
                card.innerHTML = \`
                  <div class="connected-icon">✅</div>
                  <h1 style="color:#00a884;">WhatsApp Connected!</h1>
                  <p style="color:#e9edef; font-weight:bold; margin-top:10px;">Status: READY</p>
                  <p style="color:#8696a0;">Connected as: \${data.info ? (data.info.pushname || data.info.wid) : 'WhatsApp Web'}</p>
                  <p style="font-size:12px; color:#00a884; margin-top:20px;">Your QLex print receipts & updates will now send automatically 24/7!</p>
                \`;
                return;
              } else if (data.status === 'AUTHENTICATED') {
                badge.innerText = 'Finishing Authentication...';
                badge.style.color = '#34b7f1';
              } else if (data.status === 'QR_READY') {
                badge.innerText = 'Scan QR Code to Link Device';
                badge.style.color = '#f7a600';
              } else {
                badge.innerText = 'Status: ' + data.status;
              }

              if (data.status !== 'READY') {
                const qrRes = await fetch('/qr');
                const qrData = await qrRes.json();
                const qrImg = document.getElementById('qr-img');
                const spinner = document.getElementById('loading-spinner');
                if (qrData.qr && qrImg) {
                  if (qrImg.src !== qrData.qr) {
                    qrImg.src = qrData.qr;
                  }
                  qrImg.style.display = 'block';
                  if (spinner) spinner.style.display = 'none';
                }
              }
            } catch (e) {}
          }

          pollStatus();
          setInterval(pollStatus, 3000);
        </script>
      </body>
    </html>
  `);
});

// Start Express HTTP Server
app.listen(PORT, () => {
  console.log(`[WhatsApp Bot Microservice] Running on port ${PORT}`);
});
