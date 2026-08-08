"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { PricingConfig, ServiceConfig } from "@/types/orders";
import {
  fetchPricingConfigs,
  updatePricingConfig,
  fetchPlatformSettings,
  fetchServicesConfigs,
  updateServiceConfig,
  type PlatformSettings,
  type PricingHistoryItem,
} from "@/services/shopPricing";

import PricingHeader from "./PricingHeader";
import PricingSummary from "./PricingSummary";
import BWPricingCard from "./BWPricingCard";
import ColourPricingCard from "./ColourPricingCard";
import AdditionalChargesCard from "./AdditionalChargesCard";
import PricingPreview from "./PricingPreview";
import StickyActionBar from "./StickyActionBar";
import ConfirmationPopup from "./ConfirmationPopup";
import HistorySection from "./HistorySection";
import SkeletonLoader from "./SkeletonLoader";
import Popup from "@/components/popup/Popup";

export default function ShopPricingPage() {
  // Page load state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pristine baseline state (from backend)
  const [pristinePricing, setPristinePricing] = useState<PricingConfig[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [pristineServices, setPristineServices] = useState<ServiceConfig[]>([]);

  // Draft state for shop-managed rates
  const [draftPricing, setDraftPricing] = useState<PricingConfig[]>([]);
  const [draftServices, setDraftServices] = useState<ServiceConfig[]>([]);

  // Confirmation modal & Popups
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [popupState, setPopupState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "default" | "success" | "error" | "warning" | "confirmation";
  }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
  });

  // Local change audit history
  const [history, setHistory] = useState<PricingHistoryItem[]>([]);

  // Fetch baseline pricing data from backend APIs
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pricingData, platformData, servicesData] = await Promise.all([
        fetchPricingConfigs(),
        fetchPlatformSettings(),
        fetchServicesConfigs(),
      ]);

      setPristinePricing(pricingData);
      setDraftPricing(JSON.parse(JSON.stringify(pricingData)));

      setPlatformSettings(platformData);

      setPristineServices(servicesData);
      setDraftServices(JSON.parse(JSON.stringify(servicesData)));

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to load shop pricing configurations:", err);
      const msg = err.message || "Failed to load pricing data from backend.";
      setError(msg);
      setPopupState({
        open: true,
        title: "Pricing Load Failed",
        description: msg,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle draft edits for print pricing rules
  const handlePricingChange = (
    id: string,
    field: "shop_price" | "is_active",
    value: number | boolean
  ) => {
    setDraftPricing((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Handle draft edits for finishing services
  const handleServiceChange = (
    id: string,
    field: "price" | "is_active",
    value: number | boolean
  ) => {
    setDraftServices((prev) =>
      prev.map((svc) => (svc.id === id ? { ...svc, [field]: value } : svc))
    );
  };

  // Validation rules check for shop-managed prices
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    draftPricing.forEach((item) => {
      if (isNaN(item.shop_price) || item.shop_price < 0) {
        errs[item.id] = "Price cannot be negative.";
      } else if (item.shop_price > 1000) {
        errs[item.id] = "Max price limit is ₹1,000.";
      }
    });

    draftServices.forEach((svc) => {
      if (isNaN(svc.price) || svc.price < 0) {
        errs[svc.id] = "Service price cannot be negative.";
      }
    });

    return errs;
  }, [draftPricing, draftServices]);

  const isValid = Object.keys(errors).length === 0;

  // Dirty check to identify if shop pricing changes exist
  const hasChanges = useMemo(() => {
    const pricingChanged = JSON.stringify(pristinePricing) !== JSON.stringify(draftPricing);
    const servicesChanged = JSON.stringify(pristineServices) !== JSON.stringify(draftServices);

    return pricingChanged || servicesChanged;
  }, [pristinePricing, draftPricing, pristineServices, draftServices]);

  // Restore pristine baseline values
  const handleReset = () => {
    setDraftPricing(JSON.parse(JSON.stringify(pristinePricing)));
    setDraftServices(JSON.parse(JSON.stringify(pristineServices)));
  };

  // Save shop pricing & service updates
  const handleSaveConfirmed = async () => {
    setIsSaving(true);
    setShowConfirmPopup(false);

    try {
      const newHistoryItems: PricingHistoryItem[] = [];

      // 1. Update modified print pricing configs
      for (const draftItem of draftPricing) {
        const pristineItem = pristinePricing.find((p) => p.id === draftItem.id);
        if (
          pristineItem &&
          (pristineItem.shop_price !== draftItem.shop_price ||
            pristineItem.is_active !== draftItem.is_active)
        ) {
          await updatePricingConfig(draftItem.id, {
            shop_price: draftItem.shop_price,
            is_active: draftItem.is_active,
          });

          newHistoryItems.push({
            id: `${draftItem.id}-${Date.now()}`,
            field_changed: `${draftItem.paper_size} ${draftItem.print_type.replace('_', ' ').toUpperCase()} (${draftItem.print_side})`,
            old_value: `₹${pristineItem.shop_price.toFixed(2)}`,
            new_value: `₹${draftItem.shop_price.toFixed(2)}`,
            changed_by: "Store Manager",
            changed_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          });
        }
      }

      // 2. Update modified shop finishing services
      for (const draftSvc of draftServices) {
        const pristineSvc = pristineServices.find((s) => s.id === draftSvc.id);
        if (
          pristineSvc &&
          (pristineSvc.price !== draftSvc.price || pristineSvc.is_active !== draftSvc.is_active)
        ) {
          await updateServiceConfig(draftSvc.id, {
            description: draftSvc.description,
            price: draftSvc.price,
            display_order: draftSvc.display_order,
            is_active: draftSvc.is_active,
          });

          newHistoryItems.push({
            id: `${draftSvc.id}-${Date.now()}`,
            field_changed: `Service: ${draftSvc.name}`,
            old_value: `₹${pristineSvc.price.toFixed(2)}`,
            new_value: `₹${draftSvc.price.toFixed(2)}`,
            changed_by: "Store Manager",
            changed_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          });
        }
      }

      // Sync pristine baseline with updated values
      setPristinePricing(JSON.parse(JSON.stringify(draftPricing)));
      setPristineServices(JSON.parse(JSON.stringify(draftServices)));

      if (newHistoryItems.length > 0) {
        setHistory((prev) => [...newHistoryItems, ...prev]);
      }

      setLastUpdated(new Date());

      setPopupState({
        open: true,
        title: "Pricing Updated Successfully",
        description: "New print charges and service rates are now active for all student orders.",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Failed to save pricing changes:", err);
      setPopupState({
        open: true,
        title: "Failed to Update Pricing",
        description: err.message || "An unexpected error occurred while saving pricing settings.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 py-6">
        <SkeletonLoader />
      </div>
    );
  }

  if (error && draftPricing.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-5 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Pricing Unavailable</h2>
            <p className="text-sm text-slate-400 mt-1">Pricing information could not be loaded from backend server.</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 space-y-8 pb-28">
        {/* Header */}
        <PricingHeader
          lastUpdated={lastUpdated}
          lastUpdatedBy="Store Manager"
          hasUnsavedChanges={hasChanges}
        />

        {/* Current Pricing Summary Cards */}
        <PricingSummary
          pricingConfigs={draftPricing}
          platformSettings={platformSettings}
        />

        {/* Print Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BWPricingCard
            pricingConfigs={draftPricing}
            onChange={handlePricingChange}
            errors={errors}
          />
          <ColourPricingCard
            pricingConfigs={draftPricing}
            onChange={handlePricingChange}
            errors={errors}
          />
        </div>

        {/* Additional Charges & Services */}
        <AdditionalChargesCard
          platformSettings={platformSettings}
          convenienceFee={draftPricing[0]?.convenience_fee ?? 0.5}
          servicesConfigs={draftServices}
          onServiceChange={handleServiceChange}
          errors={errors}
        />

        {/* Live Calculation Simulator */}
        <PricingPreview
          pricingConfigs={draftPricing}
          platformSettings={platformSettings}
          servicesConfigs={draftServices}
        />

        {/* Pricing Update Audit History */}
        <HistorySection history={history} />
      </div>

      {/* Bottom Sticky Action Bar */}
      <StickyActionBar
        hasChanges={hasChanges}
        isValid={isValid}
        isSaving={isSaving}
        onSave={() => setShowConfirmPopup(true)}
        onReset={handleReset}
        onCancel={handleReset}
      />

      {/* Confirmation Modal */}
      <ConfirmationPopup
        open={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={handleSaveConfirmed}
        isSaving={isSaving}
      />

      {/* Success / Error Reusable Popup Alert */}
      <Popup
        open={popupState.open}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        title={popupState.title}
        description={popupState.description}
        variant={popupState.variant}
        size="sm"
      />
    </div>
  );
}
