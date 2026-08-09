"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OrderProgressBar from "@/components/orders/OrderProgressBar";
import UploadSection from "@/components/orders/UploadSection";
import PrintOptions from "@/components/orders/PrintOptions";
import type { DocPrintSettings } from "@/components/orders/PrintOptions";
import ReviewSection from "@/components/orders/ReviewSection";
import PaymentSection from "@/components/orders/PaymentSection";
import OrderSummary from "@/components/orders/OrderSummary";
import PaymentSuccessOverlay from "@/components/orders/PaymentSuccessOverlay";
import Popup from "@/components/popup/Popup";
import SmartWaitingRoom from "@/components/waiting-room/SmartWaitingRoom";

import {
  createDraftOrder,
  uploadDocuments,
  updateDocumentSettings,
  deleteDocument,
  confirmOrder,
  createPayment,
  verifyPayment,
  getOrderSummary,
  fetchPricing,
  fetchServices,
  fetchPlatformFees,
  enterWaitingRoom,
  checkWaitingRoomStatus,
  leaveWaitingRoom,
  setWaitingRoomSession,
} from "@/services/orders";

import type {
  PricingConfig,
  ServiceConfig,
  OrderSummaryResponse,
  CreatePaymentResponse,
  OrderDocumentSummary,
  UploadedDocumentResponse,
  WaitingRoomResponse,
} from "@/types/orders";
import { PrintType, PrintSide, PaperSize } from "@/types/orders";

// ── Razorpay Script Loader ────────────────────────────────────
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay payment gateway. Please check your internet connection or ad-blocker.")));
      setTimeout(() => {
        if (typeof window !== "undefined" && (window as any).Razorpay) resolve();
      }, 500);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay payment gateway. Please check your internet connection or ad-blocker."));
    document.body.appendChild(script);
  });
}

// ── Default per-doc settings ──────────────────────────────────
function defaultDocSettings(): DocPrintSettings {
  return {
    printType: PrintType.BLACK_WHITE,
    printSide: PrintSide.SINGLE,
    paperSize: PaperSize.A4,
    copies: 1,
    spiralBinding: false,
    softBinding: false,
  };
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="deep-glass p-8 rounded-2xl border border-white/10 text-center">
        <div className="deep-glass-reflection" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 size={28} className="animate-spin text-champagne-400" />
          <p className="text-sm font-medium text-white/60">Initializing QLex Order System...</p>
        </div>
      </div>
    </div>
  );
}

function WaitingQueueUI({
  position,
  estimatedWaitSeconds,
}: {
  position: number;
  estimatedWaitSeconds: number;
}) {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="deep-glass relative w-full max-w-md overflow-hidden p-8 text-center rounded-2xl border border-white/10">
        <div className="deep-glass-reflection" />
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <Loader2 size={32} className="animate-spin text-champagne-400" />
          </div>
          <h2 className="text-xl font-bold text-white/90 mb-2">You are in queue</h2>
          <p className="text-sm text-white/40 mb-6">
            The print shop is currently handling high volume. You&apos;ll be admitted automatically.
          </p>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Queue Position</span>
              <span className="text-2xl font-extrabold text-champagne-400">#{position}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Est. Waiting Time</span>
              <span className="text-white/80 font-medium">
                ~{Math.ceil(estimatedWaitSeconds / 60)} min
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-white/30">
            Please keep this tab open. Your order session will start as soon as it&apos;s your turn.
          </p>
        </div>
      </div>
    </div>
  );
}

function ValidationPopup({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  return (
    <Popup
      open={open}
      onClose={onClose}
      title="Action Required"
      description={message}
      variant="warning"
      icon={<AlertTriangle size={24} className="text-champagne-400" />}
      showBranding
    >
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="popup-btn-primary px-6 py-2.5 text-sm"
          aria-label="Got it"
        >
          Got it
        </button>
      </div>
    </Popup>
  );
}

export default function NewOrderPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryResponse | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocumentResponse[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([]);
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [platformFees, setPlatformFees] = useState<{ platform_fee: number; priority_fee: number } | null>(null);

  // ── Per-document print settings ─────────────────────────────
  // Map of docId -> DocPrintSettings
  const [docSettings, setDocSettings] = useState<Record<string, DocPrintSettings>>({});

  // ── Order-level settings ────────────────────────────────────
  const [isPriority, setIsPriority] = useState(false);

  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePaymentResponse | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | undefined>(undefined);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const [waitingRoom, setWaitingRoom] = useState<WaitingRoomResponse | null>(null);
  const [waitingForAdmission, setWaitingForAdmission] = useState(true);

  const documentSummaries: OrderDocumentSummary[] = useMemo(() => {
    if (!orderSummary?.documents) return [];
    return orderSummary.documents;
  }, [orderSummary]);

  const totalPageCount = useMemo(() => {
    return documentSummaries.reduce((sum, d) => sum + d.page_count, 0);
  }, [documentSummaries]);

  const STEPS = [
    { id: 1, label: "Upload" },
    { id: 2, label: "Options" },
    { id: 3, label: "Review" },
    { id: 4, label: "Payment" },
  ];

  const isLastStep = currentStep === 4;
  const isFirstStep = currentStep === 1;

  // ── Waiting Room Polling ──────────────────────────────────
  useEffect(() => {
    if (!waitingForAdmission) return;
    let cancelled = false;

    async function pollUntilAdmitted() {
      try {
        let wr = await enterWaitingRoom("new_order");
        if (cancelled) return;

        while (!wr.allowed && wr.status === "WAITING") {
          setWaitingRoom(wr);
          const delay = (wr.poll_after_seconds ?? 5) * 1000;
          await new Promise((r) => setTimeout(r, delay));
          if (cancelled) return;
          wr = await checkWaitingRoomStatus();
          if (cancelled) return;
        }

        if (wr.session_token) {
          setWaitingRoomSession(wr.session_token);
        }
        setWaitingRoom(wr);
        setWaitingForAdmission(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to enter waiting room.");
          setWaitingForAdmission(false);
        }
      }
    }

    pollUntilAdmitted();
    return () => {
      cancelled = true;
    };
  }, [waitingForAdmission]);

  // ── Initialize Order Session ─────────────────────────────
  useEffect(() => {
    if (waitingForAdmission) return;
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);

        const [pricingData, servicesData, feesData] = await Promise.all([
          fetchPricing(),
          fetchServices(),
          fetchPlatformFees().catch(() => ({ platform_fee: 0, priority_fee: 0 })),
        ]);
        if (cancelled) return;
        setPricingConfigs(pricingData);
        setServices(servicesData);
        setPlatformFees(feesData);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to initialize pricing.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();

    return () => {
      cancelled = true;
    };
  }, [waitingForAdmission]);

  // ── Sync docSettings when new docs appear ─────────────────
  // When documentSummaries change (uploads), ensure every doc has settings
  useEffect(() => {
    setDocSettings((prev) => {
      const updated = { ...prev };
      let changed = false;
      for (const doc of documentSummaries) {
        if (!updated[doc.id]) {
          updated[doc.id] = defaultDocSettings();
          changed = true;
        }
      }
      // Clean up removed docs
      for (const id of Object.keys(updated)) {
        if (!documentSummaries.find((d) => d.id === id)) {
          delete updated[id];
          changed = true;
        }
      }
      return changed ? updated : prev;
    });
  }, [documentSummaries]);

  // ── Dynamic Pricing Calculation ───────────────────────────
  // Compute aggregated pricing across all docs using their individual settings
  const computePrices = useCallback(() => {
    let printCost = 0;
    let convenienceFee = 0;

    for (const doc of documentSummaries) {
      const s = docSettings[doc.id];
      if (!s) continue;

      const pricing = pricingConfigs.find(
        (p) =>
          p.paper_size === s.paperSize &&
          p.print_type === s.printType &&
          p.print_side === s.printSide &&
          p.is_active
      );

      const shopPrice = pricing ? Number(pricing.shop_price) : 0;
      const convFee = pricing ? Number(pricing.convenience_fee) : 0;

      printCost += doc.page_count * s.copies * shopPrice;
      convenienceFee += doc.page_count * s.copies * convFee;
    }

    // Services: use the first doc's settings for binding (it's a global service)
    const firstDocSettings = Object.values(docSettings)[0];
    const spiralService = services.find((s) => s.name === "Spiral Binding" && s.is_active);
    const softService = services.find((s) => s.name === "Soft Binding" && s.is_active);

    const spiralCost = firstDocSettings?.spiralBinding && spiralService
      ? Number(spiralService.price)
      : 0;
    const softCost = firstDocSettings?.softBinding && softService
      ? Number(softService.price)
      : 0;

    const subtotal = printCost + spiralCost + softCost;
    const defaultPlatformFee = platformFees ? Number(platformFees.platform_fee) : 0;
    const defaultPriorityFee = platformFees ? Number(platformFees.priority_fee) : 0;

    const platformFee = orderSummary ? Number(orderSummary.platform_fee) : defaultPlatformFee;
    const priorityFee = isPriority ? (orderSummary ? Number(orderSummary.priority_fee) : defaultPriorityFee) : 0;
    const grandTotal = subtotal + convenienceFee + platformFee + priorityFee;

    return { subtotal, convenienceFee, platformFee, priorityFee, grandTotal };
  }, [docSettings, documentSummaries, pricingConfigs, services, isPriority, orderSummary, platformFees]);

  const prices = useMemo(() => computePrices(), [computePrices]);

  // ── File Upload Handler ───────────────────────────────────
  const handleUpload = useCallback(
    async (files: File[]) => {
      try {
        setUploading(true);
        setUploadProgress(0);

        let currentOrderId = orderId;
        if (!currentOrderId) {
          const draft = await createDraftOrder(isPriority);
          currentOrderId = draft.id;
          setOrderId(draft.id);
        }

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 15, 90));
        }, 250);

        const result = await uploadDocuments(currentOrderId, files);
        clearInterval(progressInterval);
        setUploadProgress(100);

        const summary = await getOrderSummary(currentOrderId);
        setOrderSummary(summary);
        setUploadedDocs((prev) => [...prev, ...result.documents]);

        setTimeout(() => {
          setUploadProgress(0);
          setUploading(false);
        }, 400);
      } catch (err: any) {
        setUploading(false);
        setUploadProgress(0);
        setValidationMsg(err.message || "Upload failed. Please try again.");
      }
    },
    [orderId, isPriority]
  );

  // ── Remove Document Handler ───────────────────────────────
  const handleRemoveDocument = useCallback(
    async (documentId: string) => {
      if (!orderId) return;
      try {
        await deleteDocument(orderId, documentId);
        setUploadedDocs((prev) => prev.filter((d) => d.id !== documentId));
        const summary = await getOrderSummary(orderId);
        setOrderSummary(summary);
      } catch (err: any) {
        setUploadedDocs((prev) => prev.filter((d) => d.id !== documentId));
      }
    },
    [orderId]
  );

  // ── Update Print Options on Backend ───────────────────────
  const applyPrintOptions = useCallback(async () => {
    if (!orderId || documentSummaries.length === 0) return;
    try {
      for (const doc of documentSummaries) {
        const s = docSettings[doc.id];
        if (!s) continue;
        await updateDocumentSettings(orderId, doc.id, {
          paper_size: s.paperSize as PaperSize,
          print_type: s.printType as PrintType,
          print_side: s.printSide as PrintSide,
          copies: s.copies,
          spiral_binding: s.spiralBinding,
          soft_binding: s.softBinding,
        });
      }
      const summary = await getOrderSummary(orderId);
      setOrderSummary(summary);
    } catch (err: any) {
      setValidationMsg(err.message || "Failed to apply print options.");
    }
  }, [orderId, documentSummaries, docSettings]);

  // ── Navigation & Validation Handlers ───────────────────────
  const handleNext = useCallback(async () => {
    setValidationMsg(null);

    if (currentStep === 1) {
      if (uploadedDocs.length === 0) {
        setValidationMsg("Please upload at least one document before proceeding.");
        return;
      }
      await applyPrintOptions();
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await applyPrintOptions();
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!orderId) return;
      try {
        setSubmitting(true);
        const confirmed = await confirmOrder(orderId, isPriority);
        setOrderSummary(confirmed);
        setSubmitting(false);
        setCurrentStep(4);
      } catch (err: any) {
        setSubmitting(false);
        setValidationMsg(err.message || "Failed to confirm order.");
      }
    }
  }, [currentStep, uploadedDocs.length, orderId, applyPrintOptions]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    (step: number) => {
      if (step < currentStep) {
        setCurrentStep(step);
      }
    },
    [currentStep]
  );

  // ── Payment Handler ───────────────────────────────────────
  const handleContinueToPayment = useCallback(async () => {
    if (!orderId) return;
    try {
      setCreatingPayment(true);
      setPaymentError(null);

      // Load Razorpay script dynamically if not already present
      await loadRazorpayScript();

      const payment = await createPayment(orderId);
      setPaymentData(payment);

      const options = {
        key: payment.razorpay_key_id,
        amount: payment.amount * 100,
        currency: payment.currency,
        name: "QLex",
        description: `Order #${payment.order_id.slice(0, 8)}`,
        order_id: payment.razorpay_order_id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setVerifiedPaymentId(response.razorpay_payment_id);
            setCreatingPayment(false);
            setPaymentSuccess(true);
          } catch (err: any) {
            setCreatingPayment(false);
            setPaymentError(err.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            setCreatingPayment(false);
          },
        },
        theme: {
          color: "#e7c873",
        },
      };

      // @ts-ignore
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setCreatingPayment(false);
      setPaymentError(err.message || "Failed to create payment gateway session.");
    }
  }, [orderId, router]);

  // ── Aggregated print settings for review (first doc or majority) ───
  const firstDocSettings = useMemo(() => {
    const first = documentSummaries[0];
    return first ? docSettings[first.id] ?? defaultDocSettings() : defaultDocSettings();
  }, [documentSummaries, docSettings]);

  // ── Render Active Step Content ────────────────────────────
  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <UploadSection
            files={uploadedDocs}
            uploading={uploading}
            uploadProgress={uploadProgress}
            onUpload={handleUpload}
            onRemove={handleRemoveDocument}
          />
        );
      case 2:
        return (
          <PrintOptions
            documents={documentSummaries}
            pricingConfigs={pricingConfigs}
            services={services}
            docSettings={docSettings}
            onDocSettingsChange={(docId, settings) =>
              setDocSettings((prev) => ({ ...prev, [docId]: settings }))
            }
            isPriority={isPriority}
            onPriorityChange={setIsPriority}
          />
        );
      case 3:
        return (
          <ReviewSection
            documents={documentSummaries}
            docSettings={docSettings}
            printType={firstDocSettings.printType}
            printSide={firstDocSettings.printSide}
            paperSize={firstDocSettings.paperSize}
            copies={firstDocSettings.copies}
            spiralBinding={firstDocSettings.spiralBinding}
            softBinding={firstDocSettings.softBinding}
            isPriority={isPriority}
            subtotal={prices.subtotal}
            convenienceFee={prices.convenienceFee}
            platformFee={prices.platformFee}
            priorityFee={prices.priorityFee}
            grandTotal={prices.grandTotal}
          />
        );
      case 4:
        return (
          <PaymentSection
            grandTotal={prices.grandTotal}
            creatingPayment={creatingPayment}
            paymentData={paymentData}
            paymentError={paymentError}
            onContinueToPayment={handleContinueToPayment}
          />
        );
      default:
        return null;
    }
  }

  // ── Render Screens ────────────────────────────────────────
  if (waitingForAdmission && waitingRoom && !waitingRoom.allowed) {
    return (
      <ProtectedRoute>
        <SmartWaitingRoom
          waitingRoom={waitingRoom}
          onLeaveQueue={() => {
            leaveWaitingRoom().catch(() => {});
            router.push("/student/dashboard");
          }}
          onAdmitted={() => setWaitingForAdmission(false)}
        />
      </ProtectedRoute>
    );
  }

  if (loading || waitingForAdmission) return <PageSkeleton />;

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
          <div className="deep-glass relative overflow-hidden p-8 max-w-md w-full text-center rounded-2xl border border-white/10">
            <div className="deep-glass-reflection" />
            <div className="relative z-10">
              <AlertTriangle size={36} className="mx-auto text-red-400 mb-4" />
              <h2 className="text-lg font-semibold text-white/90 mb-2">Unable to Load Order</h2>
              <p className="text-sm text-white/40 mb-6">{error}</p>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="crystal-btn w-full justify-center"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsidian">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-obsidian/80 backdrop-blur-xl border-b border-white/[0.04]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/student/dashboard")}
                  className="crystal-btn !p-2.5 !rounded-xl"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="text-base font-semibold text-white/90">New Order</h1>
                  <p className="text-xs text-white/30 hidden sm:block">
                    Upload your documents and place your print order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stepper Progress Bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <OrderProgressBar currentStep={currentStep} onStepClick={handleStepClick} />
        </div>

        {/* Main Content + Sticky Summary */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-32">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Step View */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white/90">
                      {STEPS[currentStep - 1]?.label}
                    </h2>
                    <p className="text-sm text-white/40 mt-1">
                      {currentStep === 1 && "Upload your documents to get started."}
                      {currentStep === 2 && "Configure print preferences for each document."}
                      {currentStep === 3 && "Review your order before confirming."}
                      {currentStep === 4 && "Complete your payment to place the order."}
                    </p>
                  </div>

                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop Sticky Summary Panel */}
            <div className="w-full lg:w-[360px] lg:flex-shrink-0">
              <div className="hidden lg:block">
                <OrderSummary
                  documents={documentSummaries}
                  copies={firstDocSettings.copies}
                  pageCount={totalPageCount}
                  printType={firstDocSettings.printType}
                  paperSize={firstDocSettings.paperSize}
                  printSide={firstDocSettings.printSide}
                  isPriority={isPriority}
                  subtotal={prices.subtotal}
                  convenienceFee={prices.convenienceFee}
                  platformFee={prices.platformFee}
                  priorityFee={prices.priorityFee}
                  grandTotal={prices.grandTotal}
                  isSticky
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
          <div className="bg-obsidian/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Total</span>
              <span className="text-lg font-bold text-champagne-400">
                ₹{prices.grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="crystal-btn flex-1 justify-center py-3"
                  aria-label="Previous step"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}
              {!isLastStep && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className={cn(
                    "popup-btn-primary flex-1 flex items-center justify-center gap-2 py-3",
                    submitting && "opacity-60 cursor-not-allowed"
                  )}
                  aria-label="Continue"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Footer Actions */}
        <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-obsidian/80 backdrop-blur-xl border-t border-white/[0.04]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="crystal-btn"
                    aria-label="Previous step"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </button>
                )}
              </div>
              <div>
                {!isLastStep && (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={submitting}
                    className={cn(
                      "popup-btn-primary flex items-center gap-2 px-8 py-3",
                      submitting && "opacity-60 cursor-not-allowed"
                    )}
                    aria-label="Continue to next step"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GPay Style Payment Success Overlay */}
        <PaymentSuccessOverlay
          show={paymentSuccess}
          amount={prices.grandTotal}
          paymentId={verifiedPaymentId}
          orderId={orderId || undefined}
        />

        {/* Reusable Popup for Validation Messages */}
        <ValidationPopup
          open={validationMsg !== null}
          message={validationMsg || ""}
          onClose={() => setValidationMsg(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
