"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ShieldCheck,
  Users,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  LogOut,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { WaitingRoomResponse } from "@/types/orders";

interface SmartWaitingRoomProps {
  waitingRoom: WaitingRoomResponse | null;
  onLeaveQueue: () => void;
  onAdmitted: () => void;
}

// ── Web Audio Chime Sound Generator ───────────────────────────────────────
function playAdmittedChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.4); // C6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Graceful fallback if audio auto-play is restricted
  }
}

// ── Helpful Preparation Tips Carousel Items ──────────────────────────────
const WAITING_TIPS = [
  {
    icon: FileText,
    title: "Prepare Your PDF Documents",
    desc: "Ensure your files are saved in PDF format for the highest print fidelity and layout accuracy.",
  },
  {
    icon: Sparkles,
    title: "Double-Check Orientation",
    desc: "Verify portrait/landscape alignment and page numbering before final payment.",
  },
  {
    icon: Zap,
    title: "Spiral & Soft Binding",
    desc: "Select binding options for lab reports, assignments, and study materials in one step.",
  },
  {
    icon: ShieldCheck,
    title: "Express Priority Printing",
    desc: "Priority orders get fast-tracked directly to the top of shop printing queues.",
  },
];

export default function SmartWaitingRoom({
  waitingRoom,
  onLeaveQueue,
  onAdmitted,
}: SmartWaitingRoomProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [leaving, setLeaving] = useState(false);

  const isAdmitted = waitingRoom?.allowed === true || waitingRoom?.status === "ADMITTED";
  const position = waitingRoom?.position || 1;
  const estimatedSeconds = waitingRoom?.estimated_wait_seconds || position * 30;
  const trafficLevel = waitingRoom?.traffic_level || "NORMAL";
  const loadPercentage = waitingRoom?.server_load_percentage || 45;
  const totalWaiting = waitingRoom?.total_waiting_count || position;

  // Auto-play sound chime and start auto-redirect timer when admitted
  useEffect(() => {
    if (isAdmitted) {
      if (audioEnabled) {
        playAdmittedChime();
      }
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onAdmitted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAdmitted, audioEnabled, onAdmitted]);

  // Rotate tips carousel every 6 seconds
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % WAITING_TIPS.length);
    }, 6000);
    return () => clearInterval(tipTimer);
  }, []);

  // Format wait seconds into mm:ss
  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(estimatedSeconds / 60);
    const secs = estimatedSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [estimatedSeconds]);

  // Traffic badge styling
  const trafficBadge = useMemo(() => {
    switch (trafficLevel) {
      case "SURGE":
        return {
          label: "Surge Peak Volume",
          bg: "bg-red-500/10 border-red-500/30 text-red-400",
          dot: "bg-red-500",
        };
      case "HIGH":
        return {
          label: "High Traffic Volume",
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          dot: "bg-amber-500",
        };
      case "LOW":
        return {
          label: "Low Traffic - Fast Queue",
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          dot: "bg-emerald-500",
        };
      case "NORMAL":
      default:
        return {
          label: "Normal Peak Flow",
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
          dot: "bg-cyan-500",
        };
    }
  }, [trafficLevel]);

  const CurrentTipIcon = WAITING_TIPS[currentTipIndex].icon;

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-champagne-400/20">
      {/* ── Ambient Background Glows ────────────────────────────────────────────── */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-champagne-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Main Container ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-champagne-400/10 border border-champagne-400/20 flex items-center justify-center">
              <Zap size={18} className="text-champagne-400 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-white/40 font-semibold block">
                QLex Platform Protection
              </span>
              <h1 className="text-sm font-bold text-white/90">Smart Waiting Room</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? "Sound alert enabled" : "Sound alert muted"}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white"
            >
              {audioEnabled ? (
                <Volume2 size={16} className="text-champagne-400" />
              ) : (
                <VolumeX size={16} className="text-white/40" />
              )}
            </button>

            {/* Leave Queue Button */}
            <button
              type="button"
              onClick={() => {
                setLeaving(true);
                onLeaveQueue();
              }}
              disabled={leaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 transition-colors"
            >
              <LogOut size={14} />
              <span>Leave Queue</span>
            </button>
          </div>
        </div>

        {/* ── Glass Card Container ────────────────────────────────────────────────── */}
        <div className="deep-glass relative overflow-hidden rounded-3xl border border-white/10 p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
          <div className="deep-glass-reflection" />

          <AnimatePresence mode="wait">
            {isAdmitted ? (
              /* ── ADMITTED STATE ── */
              <motion.div
                key="admitted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 space-y-6"
              >
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center animate-pulse" />
                  <CheckCircle2 size={48} className="text-emerald-400 absolute" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    You&apos;re Admitted!
                  </h2>
                  <p className="text-sm text-white/60 mt-1 max-w-md mx-auto">
                    Your session is ready. Redirecting you to document setup in{" "}
                    <span className="font-bold text-champagne-400">{redirectCountdown}s</span>...
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onAdmitted}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-champagne-400 to-amber-500 text-obsidian font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span>Proceed Now</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── WAITING QUEUE STATE ── */
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Traffic Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${trafficBadge.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full animate-ping ${trafficBadge.dot}`} />
                    <span>{trafficBadge.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                    <Activity size={14} className="text-white/30 animate-spin" />
                    <span>Live Telemetry</span>
                  </div>
                </div>

                {/* Main Queue Counter Hero Box */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden text-center">
                  <div className="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">
                    Your Position in Queue
                  </div>

                  <motion.div
                    key={position}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-champagne-300 to-champagne-500 font-mono tracking-tight my-2"
                  >
                    #{position}
                  </motion.div>

                  <div className="flex items-center justify-center gap-4 text-xs text-white/60 mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-champagne-400" />
                      <span>Est. Wait:</span>
                      <span className="font-bold text-white font-mono">{formattedCountdown}</span>
                    </div>

                    <span className="text-white/20">•</span>

                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-amber-400" />
                      <span>In Queue:</span>
                      <span className="font-bold text-white font-mono">{totalWaiting}</span>
                    </div>
                  </div>
                </div>

                {/* Server Load Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Platform Processing Capacity</span>
                    <span className="font-mono font-semibold text-white/70">
                      {loadPercentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(loadPercentage, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        loadPercentage >= 85
                          ? "bg-gradient-to-r from-amber-500 to-red-500"
                          : "bg-gradient-to-r from-emerald-400 to-champagne-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Interactive Tips Carousel */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-champagne-400/10 border border-champagne-400/20 text-champagne-400 shrink-0 mt-0.5">
                      <CurrentTipIcon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-champagne-300">
                          {WAITING_TIPS[currentTipIndex].title}
                        </span>
                        <span className="text-[10px] font-mono text-white/30">
                          Tip {currentTipIndex + 1}/{WAITING_TIPS.length}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {WAITING_TIPS[currentTipIndex].desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                    <div className="flex gap-1">
                      {WAITING_TIPS.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentTipIndex(idx)}
                          className={`h-1 rounded-full transition-all ${
                            idx === currentTipIndex
                              ? "w-4 bg-champagne-400"
                              : "w-1.5 bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentTipIndex(
                            (prev) => (prev - 1 + WAITING_TIPS.length) % WAITING_TIPS.length
                          )
                        }
                        className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentTipIndex((prev) => (prev + 1) % WAITING_TIPS.length)
                        }
                        className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="flex items-center justify-center gap-2 text-center text-xs text-white/30 pt-1">
                  <AlertCircle size={14} className="shrink-0 text-white/20" />
                  <span>
                    Keep this tab open. You will be admitted automatically when your turn arrives.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
