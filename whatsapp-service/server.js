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
let currentQrCodeDataUrl = null;
let clientInfo = null;

function createClientInstance() {
  return new Client({
    authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
    puppeteer: {
      headless: true,
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--single-process",
        "--no-default-browser-check",
        "--disable-extensions"
      ]
    }
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

// 2b. Visual HTML Page for QR Code Pairing
app.get(["/", "/qr-page"], (req, res) => {
  if (botStatus === "READY") {
    return res.send(`
      <html>
        <body style="font-family:sans-serif; text-align:center; padding:50px; background:#f0f2f5;">
          <h1 style="color:#128c7e;">WhatsApp Bot is Connected! ✅</h1>
          <p>Status: <strong>READY</strong></p>
          <p>Connected as: <strong>${clientInfo ? clientInfo.pushname || clientInfo.wid : 'WhatsApp Web'}</strong></p>
        </body>
      </html>
    `);
  }
  if (!currentQrCodeDataUrl) {
    return res.send(`
      <html>
        <head><meta http-equiv="refresh" content="8"></head>
        <body style="font-family:sans-serif; text-align:center; padding:50px; background:#f0f2f5;">
          <h1>WhatsApp Bot Status: ${botStatus}</h1>
          <p>Generating QR Code... Page will auto-refresh in 8 seconds.</p>
        </body>
      </html>
    `);
  }
  return res.send(`
    <html>
      <head><meta http-equiv="refresh" content="25"></head>
      <body style="font-family:sans-serif; text-align:center; padding:40px; background:#f0f2f5;">
        <h1 style="color:#075e54;">Scan WhatsApp QR Code</h1>
        <p>Open WhatsApp on your phone &rarr; Linked Devices &rarr; Link a Device</p>
        <div style="margin:20px auto; background:white; display:inline-block; padding:20px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
          <img src="${currentQrCodeDataUrl}" alt="WhatsApp QR Code" style="width:280px; height:280px;" />
        </div>
        <p>Page auto-refreshes every 25 seconds.</p>
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
