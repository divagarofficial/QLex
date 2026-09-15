"use client";

import { useEffect, useState, useCallback } from "react";
import NonCollegeShopHeader from "./NonCollegeShopHeader";
import CounterQRCodeModal from "./CounterQRCodeModal";
import Popup from "@/components/popup/Popup";

import {
  fetchPendingSettlements,
  fetchSettlementHistory,
  fetchTodayRevenue,
  generateTodaySettlement,
  generateUpiPayment,
} from "@/services/shop";

import { formatDateDDMMYYYY } from "@/services/adminSettlements";

import { fetchPublicShopBySlug, type PublicShop } from "@/services/expressOrders";
import type { SettlementItem, TodayRevenue } from "@/types/shop";

import {
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  QrCode,
  RefreshCw,
  XCircle,
  Building2,
  Calendar,
} from "lucide-react";

interface NonCollegeShopSettlementsPageProps {
  shopSlug?: string;
}

export default function NonCollegeShopSettlementsPage({
  shopSlug: inputSlug = "acme-offset-and-printers",
}: NonCollegeShopSettlementsPageProps) {
  const shopSlug = (inputSlug || "acme-offset-and-printers").toLowerCase();

  const [shopProfile, setShopProfile] = useState<PublicShop | null>(null);
  const [shopName, setShopName] = useState<string>(
    shopSlug.includes("acme") ? "ACME OFFSET AND PRINTERS" : shopSlug.replace(/-/g, " ").toUpperCase()
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const [revenue, setRevenue] = useState<TodayRevenue>({ total_orders: 0, total_revenue: 0 });
  const [pendingSettlements, setPendingSettlements] = useState<SettlementItem[]>([]);
  const [historySettlements, setHistorySettlements] = useState<SettlementItem[]>([]);

  const [popupState, setPopupState] = useState<{
    open: boolean;
    variant: "error" | "success";
    title: string;
    description: string;
  }>({
    open: false,
    variant: "error",
    title: "",
    description: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const profile = await fetchPublicShopBySlug(shopSlug);
        if (profile && isMounted && profile.name) {
          setShopProfile(profile);
          setShopName(profile.name);
        }
      } catch (e) {
        console.log(`[NonCollegeShopSettlementsPage] Profile lookup for ${shopSlug}:`, e);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [shopSlug]);

  const loadSettlements = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const targetName = shopProfile?.name || shopName;
      const [revRes, pendRes, histRes] = await Promise.all([
        fetchTodayRevenue(targetName).catch(() => ({ total_orders: 0, total_revenue: 0 })),
        fetchPendingSettlements(targetName).catch(() => []),
        fetchSettlementHistory(targetName).catch(() => []),
      ]);

      setRevenue(revRes);
      setPendingSettlements(pendRes);
      setHistorySettlements(histRes);
    } catch (err) {
      console.error("Settlements Page Load Error:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [shopName, shopProfile?.name]);

  useEffect(() => {
    loadSettlements(true);
    const interval = setInterval(() => loadSettlements(false), 5000);
    return () => clearInterval(interval);
  }, [loadSettlements]);

  const handleGenerateSettlement = async () => {
    setActionLoading(true);
    try {
      await generateTodaySettlement();
      setPopupState({
        open: true,
        variant: "success",
        title: "Settlement Batch Created",
        description: `Daily settlement batch generated for ${shopName}.`,
      });
      await loadSettlements(false);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Failed",
        description: err.message || "Failed to generate settlement batch.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const totalSettlementPending = pendingSettlements.reduce((acc, curr) => acc + Number(curr.net_settlement_amount || curr.amount || 0), 0);
  const totalSettlementSettled = historySettlements.reduce((acc, curr) => acc + Number(curr.net_settlement_amount || curr.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans">
      <NonCollegeShopHeader
        shopName={shopName}
        shopSlug={shopSlug}
        activeTab="settlements"
        onRefresh={() => loadSettlements(false)}
        onShowQR={() => setShowQRModal(true)}
        loading={loading}
      />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-400" /> Revenue Settlements & Payouts — {shopName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automated daily revenue settlements and direct UPI payouts for {shopName}.
            </p>
          </div>

          <button
            disabled={actionLoading}
            onClick={handleGenerateSettlement}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Request Settlement Batch</span>
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Live Revenue</span>
            <div className="text-2xl font-black text-white">₹{Number(revenue.total_revenue || 0).toFixed(2)}</div>
            <span className="text-[11px] text-cyan-400 font-semibold">{revenue.total_orders} Orders Today</span>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 shadow-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disbursed Payouts</span>
            <div className="text-2xl font-black text-emerald-400">₹{totalSettlementSettled.toFixed(2)}</div>
            <span className="text-[11px] text-emerald-300 font-semibold">{historySettlements.length} Batches Disbursed</span>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-amber-500/30 p-6 shadow-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Settlement</span>
            <div className="text-2xl font-black text-amber-400">₹{totalSettlementPending.toFixed(2)}</div>
            <span className="text-[11px] text-amber-300 font-semibold">{pendingSettlements.length} Batches Pending</span>
          </div>
        </div>

        {/* Pending Settlements Section */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Clock className="w-5 h-5 text-amber-400" /> Pending Processing Batches
          </h3>

          {pendingSettlements.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl bg-black/20 text-xs">
              No pending settlement batches for {shopName}
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSettlements.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{formatDateDDMMYYYY(s.settlement_date)}</span>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {s.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Shop Revenue: ₹{Number(s.printing_revenue || s.net_settlement_amount || s.amount).toFixed(2)} • Orders: {s.orders_count || 0}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Net Amount</span>
                    <div className="text-lg font-black text-amber-400">₹{Number(s.net_settlement_amount || s.amount).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settlement History Section */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Disbursed Payout History
          </h3>

          {historySettlements.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl bg-black/20 text-xs">
              No historical completed settlements yet for {shopName}
            </div>
          ) : (
            <div className="space-y-3">
              {historySettlements.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{formatDateDDMMYYYY(s.settlement_date)}</span>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        COMPLETED
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Shop Revenue: ₹{Number(s.printing_revenue || s.net_settlement_amount || s.amount).toFixed(2)} • Orders: {s.orders_count || 0} • Ref: {s.upi_reference || "Direct UPI"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Net Disbursed</span>
                    <div className="text-lg font-black text-emerald-400">₹{Number(s.net_settlement_amount || s.amount).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <CounterQRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shopName={shopName}
        shopSlug={shopSlug}
      />

      <Popup
        open={popupState.open}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        title={popupState.title}
        description={popupState.description}
        variant={popupState.variant}
        icon={
          popupState.variant === "success" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : (
            <XCircle className="h-6 w-6 text-red-400" />
          )
        }
        showCloseButton={true}
        dismissOnBackdrop={true}
        dismissOnEsc={true}
      />
    </div>
  );
}
