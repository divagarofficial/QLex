"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Printer, Cpu, HardDrive, CheckCircle2, Send, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrinterAssignmentPanelProps {
  orderId: string;
  onDispatchSuccess: (printerName: string) => void;
}

export default function PrinterAssignmentPanel({
  orderId,
  onDispatchSuccess,
}: PrinterAssignmentPanelProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<string>("printer_1");
  const [dispatching, setDispatching] = useState<boolean>(false);

  const printers = [
    {
      id: "printer_1",
      name: "HP LaserJet Enterprise M608",
      spec: "Heavy-Duty B&W • A4 High-Speed",
      status: "Online / Ready",
      paperTray: "Tray 1: A4 (80% Full)",
      tonerLevel: "92% Toner",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      id: "printer_2",
      name: "Canon imageRUNNER C3530i",
      spec: "Production Color • A3/A4 Multi-Tray",
      status: "Online / Ready",
      paperTray: "Tray 2: A3/A4 (65% Full)",
      tonerLevel: "84% Color CMYK",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      id: "printer_3",
      name: "Epson WorkForce WF-C878R",
      spec: "High-Capacity Color InkJet • Duplex",
      status: "Idle / Ready",
      paperTray: "Tray 1: A4 (95% Full)",
      tonerLevel: "78% Ink Pack",
      statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
  ];

  const activePrinterObj = printers.find((p) => p.id === selectedPrinter) || printers[0];

  const handleDispatch = () => {
    setDispatching(true);
    setTimeout(() => {
      setDispatching(false);
      onDispatchSuccess(activePrinterObj.name);
    }, 1200);
  };

  return (
    <div className="deep-glass flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
            <Printer className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Printer Workstation Assignment
          </h3>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <Activity className="h-3 w-3 animate-pulse" /> 3 Printers Online
        </span>
      </div>

      {/* Printer Selection Cards */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-300 block">
          Select Station Printer:
        </label>
        <div className="space-y-2">
          {printers.map((printer) => (
            <div
              key={printer.id}
              onClick={() => setSelectedPrinter(printer.id)}
              className={cn(
                "flex items-center justify-between rounded-2xl border p-3.5 backdrop-blur-md transition-all cursor-pointer",
                selectedPrinter === printer.id
                  ? "border-purple-400/60 bg-purple-500/15 shadow-lg shadow-purple-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/5"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Printer
                    className={cn(
                      "h-4 w-4",
                      selectedPrinter === printer.id ? "text-purple-300" : "text-zinc-400"
                    )}
                  />
                  <span className="text-xs font-bold text-white tracking-tight">
                    {printer.name}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase",
                      printer.statusColor
                    )}
                  >
                    {printer.status}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 font-medium">{printer.spec}</p>

                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono pt-0.5">
                  <span>{printer.paperTray}</span>
                  <span>•</span>
                  <span>{printer.tonerLevel}</span>
                </div>
              </div>

              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                  selectedPrinter === printer.id
                    ? "border-purple-400 bg-purple-500 text-white"
                    : "border-white/20 bg-white/5"
                )}
              >
                {selectedPrinter === printer.id && <CheckCircle2 className="h-4 w-4" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Action Button */}
      <div className="pt-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleDispatch}
          disabled={dispatching}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-purple-400/50 bg-purple-500/20 py-3 text-xs font-black text-purple-200 shadow-lg shadow-purple-500/10 hover:bg-purple-500/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className={`h-4 w-4 ${dispatching ? "animate-bounce text-purple-300" : ""}`} />
          <span>
            {dispatching
              ? `Dispatching Job to ${activePrinterObj.name}...`
              : `Send Order Job to ${activePrinterObj.name}`}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
