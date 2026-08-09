const fs = require("fs");
const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { restoreSessionFromDB, backupSessionToDB } = require("./session_manager");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Ultra-lightweight endpoint for cron-job / pinger keep-alive
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

let botStatus = "INITIALIZING"; // INITIALIZING, QR_READY, AUTHENTICATED, READY, DISCONNECTED
process.on("unhandledRejection", (reason, p) => {
  console.log("[WhatsApp Bot] Process Warning (Unhandled Rejection):", reason ? (reason.message || reason) : reason);
});

process.on("uncaughtException", (err) => {
  console.log("[WhatsApp Bot] Process Warning (Uncaught Exception):", err ? (err.message || err) : err);
});

function createClientInstance() {
  const puppeteerOpts = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--no-default-browser-check",
      "--disable-extensions",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ]
  };

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

let client = createClientInstance();

function registerClientListeners(cli) {
  cli.on("qr", async (qr) => {
    console.log("[WhatsApp Bot] New QR Code generated.");
    botStatus = "QR_READY";
    try {
      currentQrCodeDataUrl = await QRCode.toDataURL(qr);
    } catch (err) {
      console.error("[WhatsApp Bot] Error converting QR code:", err);
    }
  });

  cli.on("authenticated", () => {
    console.log("[WhatsApp Bot] Authenticated successfully.");
    botStatus = "AUTHENTICATED";
    currentQrCodeDataUrl = null;
    setTimeout(() => backupSessionToDB(), 2000);
  });

  cli.on("auth_failure", (msg) => {
    console.error("[WhatsApp Bot] Authentication failure:", msg);
    botStatus = "DISCONNECTED";
    currentQrCodeDataUrl = null;
  });

  cli.on("ready", () => {
    console.log("[WhatsApp Bot] Client is READY and connected to WhatsApp!");
    botStatus = "READY";
    currentQrCodeDataUrl = null;
    clientInfo = cli.info ? { wid: cli.info.wid.user, pushname: cli.info.pushname } : null;
    setTimeout(() => backupSessionToDB(), 3000);
  });

  cli.on("disconnected", (reason) => {
    console.log("[WhatsApp Bot] Client disconnected:", reason);
    botStatus = "DISCONNECTED";
    currentQrCodeDataUrl = null;
    clientInfo = null;
  });
}

registerClientListeners(client);

// Initialise client with auto-retry for Puppeteer container cold-start
let initRetryTimer = null;
async function startBotEngine() {
  botStatus = "INITIALIZING";
  console.log("[WhatsApp Bot] Restoring persistent session from DB...");
  await restoreSessionFromDB();

  console.log("[WhatsApp Bot] Initializing Puppeteer Chromium engine...");
  
  client.initialize().catch((err) => {
    console.error("[WhatsApp Bot] Initialization error:", err ? err.message : err);
    botStatus = "DISCONNECTED";
    
    if (initRetryTimer) clearTimeout(initRetryTimer);
    initRetryTimer = setTimeout(() => {
      console.log("[WhatsApp Bot] Auto-re-attempting Chromium initialization...");
      try {
        client.destroy().catch(() => {});
      } catch (e) {}
      client = createClientInstance();
      registerClientListeners(client);
      startBotEngine();
    }, 4000);
  });
}

startBotEngine();

// REST API Endpoints

// 1. Get bot status
app.get("/status", (req, res) => {
  return res.json({
    success: true,
    status: botStatus,
    info: clientInfo,
    timestamp: new Date().toISOString()
  });
});

// 2. Get QR Code for pairing
app.get("/qr", (req, res) => {
  return res.json({
    success: true,
    status: botStatus,
    qr: currentQrCodeDataUrl
  });
});

// 2b. Visual HTML Page for QR Code Pairing (No Page Reloads)
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

// 3. Send WhatsApp message (supporting text and PDF file attachments)
app.post("/send", async (req, res) => {
  try {
    const { phone, message, pdfPath, mediaBase64, filename } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: 'phone' and 'message'."
      });
    }

    if (botStatus !== "READY") {
      return res.status(503).json({
        success: false,
        error: `WhatsApp bot is not ready. Current status: ${botStatus}`,
        status: botStatus
      });
    }

    // Clean phone number format
    let cleanPhone = phone.toString().replace(/[^0-9]/g, "");

    // Default to India country code 91 if 10 digits
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const chatId = `${cleanPhone}@c.us`;
    let sentMessage;

    if (pdfPath && fs.existsSync(pdfPath)) {
      console.log(`[WhatsApp Bot] Dispatching PDF attachment (${pdfPath}) to ${chatId}...`);
      const media = MessageMedia.fromFilePath(pdfPath);
      sentMessage = await client.sendMessage(chatId, media, { caption: message });
    } else if (mediaBase64) {
      console.log(`[WhatsApp Bot] Dispatching base64 PDF to ${chatId}...`);
      const media = new MessageMedia("application/pdf", mediaBase64, filename || "receipt.pdf");
      sentMessage = await client.sendMessage(chatId, media, { caption: message });
    } else {
      console.log(`[WhatsApp Bot] Dispatching text message to ${chatId}...`);
      sentMessage = await client.sendMessage(chatId, message);
    }

    const messageId = sentMessage?.id?._serialized || sentMessage?.id?.id || "sent_ok";

    return res.json({
      success: true,
      messageId: messageId,
      recipient: cleanPhone,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[WhatsApp Bot] Failed to send message:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to send WhatsApp message"
    });
  }
});

// 4. Logout / Reset session
app.post("/logout", async (req, res) => {
  try {
    await client.logout();
    botStatus = "DISCONNECTED";
    clientInfo = null;
    currentQrCodeDataUrl = null;

    // Re-initialize for new QR
    client.initialize().catch(console.error);

    return res.json({
      success: true,
      message: "Logged out from WhatsApp Web. Re-initializing for new QR pairing."
    });
  } catch (err) {
    console.error("[WhatsApp Bot] Error during logout:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to logout"
    });
  }
});

app.listen(PORT, () => {
  console.log(`[WhatsApp Bot Microservice] Running on http://localhost:${PORT}`);
});
