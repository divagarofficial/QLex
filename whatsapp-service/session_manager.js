const fs = require("fs");
const path = require("path");

const BACKEND_URL = process.env.BACKEND_API_URL || "https://qlex-backend-44277514752.asia-south1.run.app/api/v1";

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function packAuthFolder(authDir = "./.wwebjs_auth") {
  if (!fs.existsSync(authDir)) return null;
  const filePaths = getAllFiles(authDir);
  const bundle = {};

  filePaths.forEach((filePath) => {
    const relPath = path.relative(authDir, filePath).replace(/\\/g, "/");
    try {
      const content = fs.readFileSync(filePath, "base64");
      bundle[relPath] = content;
    } catch (err) {
      console.error(`[SessionManager] Error reading file ${relPath}:`, err);
    }
  });

  return JSON.stringify(bundle);
}

function unpackAuthFolder(jsonString, authDir = "./.wwebjs_auth") {
  if (!jsonString) return false;
  try {
    const bundle = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    Object.keys(bundle).forEach((relPath) => {
      const targetPath = path.join(authDir, relPath);
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const buffer = Buffer.from(bundle[relPath], "base64");
      fs.writeFileSync(targetPath, buffer);
    });

    console.log("[SessionManager] Successfully restored session files from database backup!");
    return true;
  } catch (err) {
    console.error("[SessionManager] Failed to unpack session files:", err);
    return false;
  }
}

async function restoreSessionFromDB(authDir = "./.wwebjs_auth") {
  if (fs.existsSync(authDir) && fs.readdirSync(authDir).length > 0) {
    console.log("[SessionManager] Local session folder exists. Using local session.");
    return true;
  }

  console.log("[SessionManager] Checking Supabase DB for remote session backup...");
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${BACKEND_URL}/admin/whatsapp/session-data`, { signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);
    if (!res) return false;
    const data = await res.json().catch(() => null);
    if (data?.success && data?.session_data) {
      return unpackAuthFolder(data.session_data, authDir);
    }
  } catch (err) {
    console.log("[SessionManager] No remote session restored:", err.message || err);
  }
  return false;
}

async function backupSessionToDB(authDir = "./.wwebjs_auth") {
  try {
    console.log("[SessionManager] Backing up active session to Supabase DB...");
    const jsonString = packAuthFolder(authDir);
    if (!jsonString) return false;

    const res = await fetch(`${BACKEND_URL}/admin/whatsapp/session-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_data: jsonString })
    });
    const data = await res.json();
    if (data?.success) {
      console.log("[SessionManager] Session backup saved to Supabase DB successfully!");
      return true;
    }
  } catch (err) {
    console.error("[SessionManager] Failed to save session backup:", err.message);
  }
  return false;
}

module.exports = {
  restoreSessionFromDB,
  backupSessionToDB
};
