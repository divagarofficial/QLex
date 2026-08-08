"use client";

import React, { useState } from "react";
import {
  Layers,
  CreditCard,
  HardDrive,
  Flame,
  Mail,
  Globe,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sliders,
  RefreshCw,
  X,
  Save,
} from "lucide-react";
import { IntegrationItem, IntegrationStatus } from "./types";
import { testIntegrationConnectionApi } from "@/services/adminPlatformSettings";
import Popup from "@/components/popup/Popup";
import { cn } from "@/lib/utils";

interface IntegrationSettingsTabProps {
  integrations: IntegrationItem[];
  onChange?: (updated: IntegrationItem[]) => void;
  onTestConnection?: (id: string) => void;
  onConfigure?: (id: string) => void;
}

export default function IntegrationSettingsTab({
  integrations,
  onChange,
  onTestConnection,
  onConfigure,
}: IntegrationSettingsTabProps) {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // Configuration modal state
  const [editingItem, setEditingItem] = useState<IntegrationItem | null>(null);
  const [editStatus, setEditStatus] = useState<IntegrationStatus>("connected");
  const [editDetails, setEditDetails] = useState<Record<string, string>>({});

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await testIntegrationConnectionApi(id);
      setTestResult({
        id,
        success: res.success,
        message: res.message,
      });
      if (onTestConnection) onTestConnection(id);
    } catch (err: any) {
      setTestResult({
        id,
        success: false,
        message: err?.message || "Failed connection test to backend gateway.",
      });
    } finally {
      setTestingId(null);
    }
  };

  const openConfigModal = (item: IntegrationItem) => {
    setEditingItem(item);
    setEditStatus(item.status);
    setEditDetails(item.details ? { ...item.details } : {});
    if (onConfigure) onConfigure(item.id);
  };

  const saveConfig = () => {
    if (!editingItem || !onChange) return;
    const updatedList = integrations.map((it) => {
      if (it.id === editingItem.id) {
        return {
          ...it,
          status: editStatus,
          details: editDetails,
        };
      }
      return it;
    });
    onChange(updatedList);
    setEditingItem(null);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "razorpay":
        return <CreditCard className="h-5 w-5 text-emerald-400" />;
      case "r2":
        return <HardDrive className="h-5 w-5 text-blue-400" />;
      case "firebase":
        return <Flame className="h-5 w-5 text-amber-400" />;
      case "smtp":
        return <Mail className="h-5 w-5 text-violet-400" />;
      case "oauth":
        return <Globe className="h-5 w-5 text-cyan-400" />;
      case "whatsapp":
        return <MessageSquare className="h-5 w-5 text-emerald-400" />;
      default:
        return <Layers className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case "connected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            <span>Connected</span>
          </span>
        );
      case "configuration_required":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="h-3 w-3" />
            <span>Config Required</span>
          </span>
        );
      case "disconnected":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
            <XCircle className="h-3 w-3" />
            <span>Disconnected</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Backend Supported Integrations</h2>
            <p className="text-xs text-zinc-400">
              Only displaying services and API gateways actively supported by the QLex backend engine
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    {getIcon(item.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{item.name}</h3>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>

              {item.details && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] text-zinc-400 font-mono">
                  {Object.entries(item.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-zinc-500">{k}:</span>
                      <span className="text-zinc-300 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {testResult?.id === item.id && (
                <div
                  className={cn(
                    "p-2.5 rounded-xl border text-[11px] flex items-center gap-2",
                    testResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  )}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => openConfigModal(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all"
                >
                  <Sliders className="h-3.5 w-3.5 text-amber-400" />
                  <span>Configure</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTest(item.id)}
                  disabled={testingId === item.id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 text-blue-400", testingId === item.id && "animate-spin")} />
                  <span>{testingId === item.id ? "Testing..." : "Test Connection"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Configuration Popup */}
      <Popup
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={`Configure ${editingItem?.name || "Integration"}`}
        description="Update service status, API parameters, and environment credentials"
        icon={<Sliders className="h-5 w-5 text-amber-400" />}
        variant="info"
      >
        {editingItem && (
          <div className="space-y-4 text-xs">
            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">Integration Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as IntegrationStatus)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 cursor-pointer [&>option]:bg-zinc-900"
              >
                <option value="connected">Connected (Active)</option>
                <option value="configuration_required">Configuration Required</option>
                <option value="disconnected">Disconnected (Disabled)</option>
              </select>
            </div>

            {/* Parameter Fields */}
            <div className="space-y-3 pt-2">
              <span className="font-semibold text-zinc-300">Parameters & Settings</span>
              {Object.entries(editDetails).map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-mono">{k}</label>
                  <input
                    type="text"
                    value={v}
                    onChange={(e) =>
                      setEditDetails((prev) => ({
                        ...prev,
                        [k]: e.target.value,
                      }))
                    }
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveConfig}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 active:scale-95 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}
