"use client";

import React, { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Send, AlertTriangle, AlertCircle, Store, FileX, RefreshCw, CheckCircle2, QrCode } from "lucide-react";
import { NotificationSettingsState } from "./types";
import { cn } from "@/lib/utils";

interface NotificationSettingsTabProps {
  data: NotificationSettingsState;
  onChange: (updated: Partial<NotificationSettingsState>) => void;
}

export default function NotificationSettingsTab({ data, onChange }: NotificationSettingsTabProps) {
  const [waStatus, setWaStatus] = useState<string>("INITIALIZING");
  const [waQr, setWaQr] = useState<string | null>(null);
  const [waUser, setWaUser] = useState<string | null>(null);
  const [waBotUrl, setWaBotUrl] = useState<string>("http://localhost:5001");
  const [loadingWa, setLoadingWa] = useState<boolean>(false);
  const [startingBot, setStartingBot] = useState<boolean>(false);
  const [testPhone, setTestPhone] = useState<string>("");
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const getApiBase = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    return base.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  };

  const handleSendTestMessage = async () => {
    if (!testPhone) return;
    setSendingTest(true);
    setTestSuccess(null);
    try {
      const apiBase = getApiBase();
      let sent = false;

      // 1. Try backend proxy
      try {
        const res = await fetch(`${apiBase}/admin/whatsapp/test-send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: testPhone,
            message: "🧪 *QLex WhatsApp Test Alert*\n\nYour QLex WhatsApp notification service is working perfectly! 🚀"
          })
        }).then(r => r.json()).catch(() => null);

        if (res?.success) {
          sent = true;
        }
      } catch {}

      // 2. Direct fallback to active tunnel service
      if (!sent) {
        try {
          const directRes = await fetch("https://fuzzy-views-serve.loca.lt/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Bypass-Tunnel-Reminder": "true"
            },
            body: JSON.stringify({
              phone: testPhone,
              message: "🧪 *QLex WhatsApp Test Alert*\n\nYour QLex WhatsApp notification service is working perfectly! 🚀"
            })
          }).then(r => r.json()).catch(() => null);

          if (directRes?.success) {
            sent = true;
          }
        } catch {}
      }

      // 3. Direct fallback to local service
      if (!sent) {
        try {
          const localRes = await fetch("http://localhost:5001/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: testPhone,
              message: "🧪 *QLex WhatsApp Test Alert*\n\nYour QLex WhatsApp notification service is working perfectly! 🚀"
            })
          }).then(r => r.json()).catch(() => null);

          if (localRes?.success) {
            sent = true;
          }
        } catch {}
      }

      if (sent) {
        setTestSuccess("Test notification sent successfully!");
        setTimeout(() => setTestSuccess(null), 5000);
      } else {
        setTestSuccess("Failed to send test message. Check bot status.");
      }
    } catch {
      setTestSuccess("Network error sending test message.");
    } finally {
      setSendingTest(false);
    }
  };

  const fetchWaBotInfo = async () => {
    setLoadingWa(true);
    try {
      const apiBase = getApiBase();
      const [statusRes, qrRes] = await Promise.all([
        fetch(`${apiBase}/admin/whatsapp/status`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch(`${apiBase}/admin/whatsapp/qr`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      ]);

      let finalStatus = statusRes?.status || "DISCONNECTED";
      let finalInfo = statusRes?.info;
      let finalQr = qrRes?.qr || null;

      if (statusRes?.bot_url) {
        setWaBotUrl(statusRes.bot_url);
      }

      // Fail-safe direct tunnel/local checks if backend status returns DISCONNECTED/error
      if (finalStatus === "DISCONNECTED") {
        try {
          const tunnelRes = await fetch("https://fuzzy-views-serve.loca.lt/status", {
            cache: "no-store",
            headers: { "Bypass-Tunnel-Reminder": "true" }
          }).then((r) => r.json()).catch(() => null);
          if (tunnelRes?.status && tunnelRes.status !== "DISCONNECTED") {
            finalStatus = tunnelRes.status;
            finalInfo = tunnelRes.info;
            setWaBotUrl("https://fuzzy-views-serve.loca.lt");
          }
        } catch {}
      }

      if (finalStatus === "DISCONNECTED") {
        try {
          const localRes = await fetch("http://localhost:5001/status", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
          if (localRes?.status && localRes.status !== "DISCONNECTED") {
            finalStatus = localRes.status;
            finalInfo = localRes.info;
            setWaBotUrl("http://localhost:5001");
          }
        } catch {}
      }

      if (finalStatus === "QR_READY" && !finalQr) {
        try {
          const tunnelQrRes = await fetch("https://fuzzy-views-serve.loca.lt/qr", {
            cache: "no-store",
            headers: { "Bypass-Tunnel-Reminder": "true" }
          }).then((r) => r.json()).catch(() => null);
          if (tunnelQrRes?.qr) {
            finalQr = tunnelQrRes.qr;
          }
        } catch {}
      }

      setWaStatus(finalStatus);
      if (finalInfo?.wid) {
        setWaUser(finalInfo.wid);
      }
      setWaQr(finalQr);
    } catch {
      setWaStatus("DISCONNECTED");
    } finally {
      setLoadingWa(false);
    }
  };

  const handleStartBot = async () => {
    setStartingBot(true);
    try {
      const apiBase = getApiBase();
      await fetch(`${apiBase}/admin/whatsapp/start`, { method: "POST" });
      setWaStatus("INITIALIZING");
      setTimeout(fetchWaBotInfo, 2000);
    } catch {
      // Ignore error
    } finally {
      setStartingBot(false);
    }
  };

  const handleLogoutBot = async () => {
    setLoadingWa(true);
    try {
      const apiBase = getApiBase();
      await fetch(`${apiBase}/admin/whatsapp/logout`, { method: "POST" });
      fetchWaBotInfo();
    } catch {
      // Ignore error
    } finally {
      setLoadingWa(false);
    }
  };

  useEffect(() => {
    if (data.whatsappNotifications) {
      fetchWaBotInfo();
      // Poll less frequently (every 60s when READY, every 15s when pairing) to save resources
      const pollInterval = waStatus === "READY" ? 60000 : 15000;
      const interval = setInterval(fetchWaBotInfo, pollInterval);
      return () => clearInterval(interval);
    }
  }, [data.whatsappNotifications, waStatus]);

  return (
    <div className="space-y-6">
      {/* Channels Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Notification Communication Channels</h2>
            <p className="text-xs text-zinc-400">Configure multi-channel dispatch engines for students and vendors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>SMTP Email Notifications</span>
              </div>
              <p className="text-[11px] text-zinc-400">Transactional receipts and account alerts via email</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.emailNotifications}
              onClick={() => onChange({ emailNotifications: !data.emailNotifications })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.emailNotifications ? "bg-blue-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.emailNotifications ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* WhatsApp Notifications */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <span>WhatsApp Cloud Bot (Google Cloud Run)</span>
                </div>
                <p className="text-[11px] text-zinc-400">Instant order receipts & status updates on WhatsApp</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={data.whatsappNotifications}
                onClick={() => onChange({ whatsappNotifications: !data.whatsappNotifications })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  data.whatsappNotifications ? "bg-emerald-500" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    data.whatsappNotifications ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* WhatsApp Web Bot Pairing Sub-card */}
            {data.whatsappNotifications && (
              <div className="mt-2 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                    {waStatus === "READY" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Connected {waUser ? `(${waUser})` : ""}</span>
                      </>
                    ) : waStatus === "QR_READY" ? (
                      <>
                        <QrCode className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400 font-semibold">Scan QR Code to Pair</span>
                      </>
                    ) : waStatus === "INITIALIZING" ? (
                      <>
                        <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin" />
                        <span className="text-emerald-400">Initializing Engine...</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400">Status: DISCONNECTED</span>
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {waStatus === "READY" && (
                      <button
                        type="button"
                        onClick={handleLogoutBot}
                        disabled={loadingWa}
                        className="px-2 py-0.5 text-[11px] text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded transition-colors"
                        title="Unlink WhatsApp session"
                      >
                        Unlink
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={fetchWaBotInfo}
                      disabled={loadingWa}
                      className="p-1 text-zinc-400 hover:text-white transition-colors"
                      title="Refresh WhatsApp Bot Status"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", loadingWa && "animate-spin")} />
                    </button>
                  </div>
                </div>

                {waStatus === "READY" && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                    <p className="text-[11px] font-medium text-emerald-300">Test Live WhatsApp Notification</p>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="Enter 10-digit Phone #"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 flex-1 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSendTestMessage}
                        disabled={sendingTest || !testPhone}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{sendingTest ? "Sending..." : "Send Test"}</span>
                      </button>
                    </div>
                    {testSuccess && <p className="text-[11px] text-emerald-400 font-medium">{testSuccess}</p>}
                  </div>
                )}

                {waStatus === "QR_READY" && (
                  <div className="flex flex-col items-center gap-3 p-3.5 rounded-lg bg-white/5 border border-white/10">
                    {waQr ? (
                      <img src={waQr} alt="WhatsApp QR Code" className="w-44 h-44 rounded-lg shadow-md border border-white/20 bg-white p-1" />
                    ) : null}
                    <a
                      href={waBotUrl || "http://localhost:5001"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Click Here to View &amp; Scan QR Code</span>
                    </a>
                    <p className="text-[11px] text-zinc-300 text-center font-mono">
                      Open WhatsApp on phone &gt; Linked Devices &gt; Scan QR Code
                    </p>
                  </div>
                )}

                {waStatus === "INITIALIZING" && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-center space-y-1">
                    <p className="text-[11px] text-emerald-300 animate-pulse font-medium">
                      Launching Headless Engine &amp; fetching QR pairing code...
                    </p>
                    <p className="text-[10px] text-zinc-400">Please wait 5-15 seconds.</p>
                  </div>
                )}

                {waStatus === "DISCONNECTED" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-zinc-400">
                      Microservice status: <span className="text-amber-400 font-semibold">Disconnected</span>. Open the pairing webpage below to view status or scan QR code.
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={waBotUrl || "http://localhost:5001"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>Open WhatsApp Pairing Page</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-violet-400" />
                <span>PWA Web Push Notifications</span>
              </div>
              <p className="text-[11px] text-zinc-400">Real-time desktop/mobile push alerts for queue progress</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.pushNotifications}
              onClick={() => onChange({ pushNotifications: !data.pushNotifications })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.pushNotifications ? "bg-violet-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.pushNotifications ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-amber-400" />
                <span>SMS Gateway</span>
              </div>
              <p className="text-[11px] text-zinc-400">Fallback SMS alerts for high-priority security OTPs</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.smsNotifications}
              onClick={() => onChange({ smsNotifications: !data.smsNotifications })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.smsNotifications ? "bg-amber-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.smsNotifications ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Admin System Alerts Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Administrator Trigger Alerts</h2>
            <p className="text-xs text-zinc-400">Automated event triggers delivered to central admin dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low Settlement Alert */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span>Low Settlement Balance Alert</span>
              </div>
              <p className="text-[11px] text-zinc-400">Triggers when shop pending settlement surpasses threshold</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.lowSettlementAlert}
              onClick={() => onChange({ lowSettlementAlert: !data.lowSettlementAlert })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.lowSettlementAlert ? "bg-amber-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.lowSettlementAlert ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Payment Failure Alert */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Razorpay Gateway Payment Failure Alert</span>
              </div>
              <p className="text-[11px] text-zinc-400">Immediate alert when razorpay webhook reports failed payment</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.paymentFailureAlert}
              onClick={() => onChange({ paymentFailureAlert: !data.paymentFailureAlert })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.paymentFailureAlert ? "bg-rose-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.paymentFailureAlert ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* New Shop Alert */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Store className="h-4 w-4 text-cyan-400" />
                <span>New Shop Onboarding Alert</span>
              </div>
              <p className="text-[11px] text-zinc-400">Notifies when new print shop requests admin approval</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.newShopAlert}
              onClick={() => onChange({ newShopAlert: !data.newShopAlert })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.newShopAlert ? "bg-cyan-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.newShopAlert ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Order Failure Alert */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <FileX className="h-4 w-4 text-orange-400" />
                <span>Print Job Execution Failure Alert</span>
              </div>
              <p className="text-[11px] text-zinc-400">Alerts when print shop terminal reports printer or paper stall</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.orderFailureAlert}
              onClick={() => onChange({ orderFailureAlert: !data.orderFailureAlert })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.orderFailureAlert ? "bg-orange-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.orderFailureAlert ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
