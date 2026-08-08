"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import PricingHeader from "./PricingHeader";
import PricingOverview from "./PricingOverview";
import PlatformChargesCard from "./PlatformChargesCard";
import PrintPricingCard from "./PrintPricingCard";
import PriorityPricingCard from "./PriorityPricingCard";
import FinishingServicesCard from "./FinishingServicesCard";
import PricingCalculator from "./PricingCalculator";
import PricingModeCard from "./PricingModeCard";
import RecentChanges from "./RecentChanges";
import StickySaveBar from "./StickySaveBar";
import SkeletonLoader from "./SkeletonLoader";
import Popup from "@/components/popup/Popup";
import {
  getPricingRules,
  updatePricingRule,
  getServiceRules,
  getPlatformSettings,
  updatePlatformSettings,
  PricingRule,
  ServiceRule,
  PlatformSettings,
  AuditLogItem,
} from "@/services/adminPricing";

export default function AdminPricingPage() {
  // ── Read-only (merchant-set) ──────────────────────────
  const [originalRules, setOriginalRules] = useState<PricingRule[]>([]);
  const [services, setServices] = useState<ServiceRule[]>([]);
  const [originalSettings, setOriginalSettings] = useState<PlatformSettings | null>(null);

  // ── Admin-editable working copies ────────────────────
  // platform_settings table: platform_fee, priority_fee, allow_new_orders
  const [editedPlatformFee, setEditedPlatformFee] = useState<number>(0);
  const [editedPriorityFee, setEditedPriorityFee] = useState<number>(0);
  const [editedAllowNewOrders, setEditedAllowNewOrders] = useState<boolean>(true);

  // pricing table: convenience_fee per rule (shop_price stays read-only)
  const [editedRules, setEditedRules] = useState<PricingRule[]>([]);

  // ── UI state ─────────────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [popupState, setPopupState] = useState<{
    open: boolean;
    variant: "info" | "success" | "warning" | "error" | "confirmation";
    title: string;
    description: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "info", title: "", description: "" });

  // ── Fetch all backend config ──────────────────────────
  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const [rules, svcs, settings] = await Promise.all([
        getPricingRules(),
        getServiceRules(),
        getPlatformSettings(),
      ]);

      setOriginalRules(rules);
      setServices(svcs);
      setOriginalSettings(settings);

      // Working copies for editable fields
      setEditedRules(JSON.parse(JSON.stringify(rules)));
      setEditedPlatformFee(settings.platform_fee);
      setEditedPriorityFee(settings.priority_fee);
      setEditedAllowNewOrders(settings.allow_new_orders);

      setLastUpdated(new Date());
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Connection Error",
        description: err?.message || "Failed to load pricing from backend.",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Detect unsaved changes ────────────────────────────
  const hasChanges = useMemo(() => {
    if (!originalSettings) return false;
    if (editedPlatformFee !== originalSettings.platform_fee) return true;
    if (editedPriorityFee !== originalSettings.priority_fee) return true;
    if (editedAllowNewOrders !== originalSettings.allow_new_orders) return true;
    // convenience_fee per rule
    for (const rule of editedRules) {
      const orig = originalRules.find((r) => r.id === rule.id);
      if (orig && Number(orig.convenience_fee) !== Number(rule.convenience_fee)) return true;
    }
    return false;
  }, [originalSettings, originalRules, editedRules, editedPlatformFee, editedPriorityFee, editedAllowNewOrders]);

  // ── Handlers ──────────────────────────────────────────
  const handleConvenienceFeeChange = (ruleId: string, fee: number) => {
    setEditedRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, convenience_fee: fee } : r))
    );
  };

  const handleReset = () => {
    if (!originalSettings) return;
    setEditedRules(JSON.parse(JSON.stringify(originalRules)));
    setEditedPlatformFee(originalSettings.platform_fee);
    setEditedPriorityFee(originalSettings.priority_fee);
    setEditedAllowNewOrders(originalSettings.allow_new_orders);
  };

  const handleSaveClick = () => {
    setPopupState({
      open: true,
      variant: "confirmation",
      title: "Update Fee Surcharges?",
      description:
        "This will save all edited fee surcharges (platform fee, priority surcharge, convenience fees). Changes apply to all future student orders.",
      confirmText: "Yes, Update Fees",
      onConfirm: confirmSave,
    });
  };

  // ── Backend save ──────────────────────────────────────
  const confirmSave = async () => {
    if (!originalSettings) return;
    setIsSaving(true);
    const newLogs: AuditLogItem[] = [];

    try {
      // 1. Update platform_settings (platform_fee, priority_fee, allow_new_orders)
      const settingsChanged =
        editedPlatformFee !== originalSettings.platform_fee ||
        editedPriorityFee !== originalSettings.priority_fee ||
        editedAllowNewOrders !== originalSettings.allow_new_orders;

      if (settingsChanged) {
        if (editedPlatformFee !== originalSettings.platform_fee) {
          newLogs.push({
            id: `log-${Date.now()}-pf`,
            field_changed: "Platform Service Fee",
            old_value: `₹${originalSettings.platform_fee.toFixed(2)}`,
            new_value: `₹${editedPlatformFee.toFixed(2)}`,
            changed_by: "Administrator",
            changed_at: new Date().toISOString(),
          });
        }
        if (editedPriorityFee !== originalSettings.priority_fee) {
          newLogs.push({
            id: `log-${Date.now()}-pr`,
            field_changed: "Express Priority Surcharge",
            old_value: `₹${originalSettings.priority_fee.toFixed(2)}`,
            new_value: `₹${editedPriorityFee.toFixed(2)}`,
            changed_by: "Administrator",
            changed_at: new Date().toISOString(),
          });
        }
        if (editedAllowNewOrders !== originalSettings.allow_new_orders) {
          newLogs.push({
            id: `log-${Date.now()}-ao`,
            field_changed: "Order Acceptance",
            old_value: originalSettings.allow_new_orders ? "Enabled" : "Paused",
            new_value: editedAllowNewOrders ? "Enabled" : "Paused",
            changed_by: "Administrator",
            changed_at: new Date().toISOString(),
          });
        }
        await updatePlatformSettings({
          platform_fee: editedPlatformFee,
          priority_fee: editedPriorityFee,
          allow_new_orders: editedAllowNewOrders,
          max_documents_per_order: originalSettings.max_documents_per_order,
          max_upload_size_mb: originalSettings.max_upload_size_mb,
          max_pages_per_document: originalSettings.max_pages_per_document,
          draft_expiry_hours: originalSettings.draft_expiry_hours,
          queue_timeout_minutes: originalSettings.queue_timeout_minutes,
          maintenance_mode: originalSettings.maintenance_mode,
        });
      }

      // 2. Update convenience_fee on each modified pricing rule via PUT /pricing/{id}
      for (const rule of editedRules) {
        const orig = originalRules.find((r) => r.id === rule.id);
        if (orig && Number(orig.convenience_fee) !== Number(rule.convenience_fee)) {
          newLogs.push({
            id: `log-${Date.now()}-${rule.id}`,
            field_changed: `Convenience Fee — ${rule.paper_size} ${rule.print_type === "BW" ? "B&W" : "Colour"} ${rule.print_side === "SINGLE" ? "Single" : "Double"} Side`,
            old_value: `₹${Number(orig.convenience_fee).toFixed(2)} / page`,
            new_value: `₹${Number(rule.convenience_fee).toFixed(2)} / page`,
            changed_by: "Administrator",
            changed_at: new Date().toISOString(),
          });
          // shop_price stays the same (read-only), only convenience_fee changes
          await updatePricingRule(rule.id, Number(rule.shop_price), Number(rule.convenience_fee), rule.is_active);
        }
      }

      setAuditLogs((prev) => [...newLogs, ...prev]);
      await fetchData();

      setPopupState({
        open: true,
        variant: "success",
        title: "Fee Surcharges Updated",
        description: "Platform fee surcharges and convenience fees have been saved successfully.",
      });
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Update Failed",
        description: err?.message || "Could not save fee surcharges. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans pb-32">
      <div className="max-w-[1100px] mx-auto space-y-6">
        <PricingHeader
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={() => fetchData(true)}
        />

        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Overview Summary */}
            <PricingOverview
              pricingRules={editedRules}
              settings={
                originalSettings
                  ? { ...originalSettings, platform_fee: editedPlatformFee, priority_fee: editedPriorityFee }
                  : null
              }
            />

            {/* EDITABLE — platform_fee + priority_fee from platform_settings */}
            <PlatformChargesCard
              platformFee={editedPlatformFee}
              priorityFee={editedPriorityFee}
              onPlatformFeeChange={setEditedPlatformFee}
              onPriorityFeeChange={setEditedPriorityFee}
            />

            {/* EDITABLE — convenience_fee per rule; shop_price read-only */}
            <PrintPricingCard
              pricingRules={editedRules}
              onConvenienceFeeChange={handleConvenienceFeeChange}
            />

            {/* Priority queue policy + order toggle */}
            <PriorityPricingCard
              priorityFee={editedPriorityFee}
              allowNewOrders={editedAllowNewOrders}
              onAllowNewOrdersToggle={setEditedAllowNewOrders}
            />

            {/* READ-ONLY — finishing services (set by merchant) */}
            <FinishingServicesCard services={services} />

            {/* Live Simulator */}
            <PricingCalculator
              pricingRules={editedRules}
              services={services}
              platformFee={editedPlatformFee}
              priorityFee={editedPriorityFee}
            />

            <PricingModeCard />
            <RecentChanges logs={auditLogs} />
          </>
        )}
      </div>

      <StickySaveBar
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={handleSaveClick}
        onReset={handleReset}
      />

      <Popup
        open={popupState.open}
        variant={popupState.variant}
        title={popupState.title}
        description={popupState.description}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
      >
        {popupState.confirmText && (
          <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setPopupState((prev) => ({ ...prev, open: false }))}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const fn = popupState.onConfirm;
                setPopupState((prev) => ({ ...prev, open: false }));
                if (fn) fn();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg transition-all"
            >
              {popupState.confirmText}
            </button>
          </div>
        )}
      </Popup>
    </div>
  );
}
