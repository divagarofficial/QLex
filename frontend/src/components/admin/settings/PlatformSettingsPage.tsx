"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getBackendPlatformSettings,
  updateBackendPlatformSettings,
  getServerHealthInfo,
  BackendPlatformSettings,
} from "@/services/adminPlatformSettings";
import {
  FullSettingsState,
  SettingsSectionId,
  IntegrationItem,
} from "./types";
import SettingsHeader from "./SettingsHeader";
import SettingsSidebar, { SETTINGS_SECTIONS } from "./SettingsSidebar";
import GeneralSettings from "./GeneralSettings";
import PlatformSettingsTab from "./PlatformSettingsTab";
import OrderSettingsTab from "./OrderSettingsTab";
import NotificationSettingsTab from "./NotificationSettingsTab";
import SecuritySettingsTab from "./SecuritySettingsTab";
import IntegrationSettingsTab from "./IntegrationSettingsTab";
import AppearanceSettingsTab from "./AppearanceSettingsTab";
import AdvancedSettingsTab from "./AdvancedSettingsTab";
import AboutSectionTab from "./AboutSectionTab";
import StickySaveBar from "./StickySaveBar";
import SkeletonLoader from "./SkeletonLoader";
import Popup from "@/components/popup/Popup";
import AdminProtectedRoute from "../AdminProtectedRoute";
import { Search, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";


const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "razorpay",
    name: "Razorpay Payment Gateway",
    category: "Payments",
    description: "Online student UPI, debit card, and net banking payment processing",
    status: "connected",
    iconName: "razorpay",
    isBackendSupported: true,
    details: { Mode: "Live Webhook Synchronized", Currency: "INR (₹)" },
  },
  {
    id: "r2",
    name: "Cloudflare R2 / Upload Storage",
    category: "Object Storage",
    description: "High-speed encrypted PDF upload storage and CDN distribution",
    status: "connected",
    iconName: "r2",
    isBackendSupported: true,
    details: { Storage: "Local Uploads Directory / R2 API", MaxSize: "50 MB" },
  },
  {
    id: "firebase",
    name: "Firebase Cloud Messaging (FCM)",
    category: "Notifications",
    description: "Real-time mobile and browser web push notification engine",
    status: "connected",
    iconName: "firebase",
    isBackendSupported: true,
    details: { FCM: "Active", Scope: "Queue & Settlement Alerts" },
  },
  {
    id: "smtp",
    name: "Transactional SMTP Email Gateway",
    category: "Email",
    description: "Automated student receipts, password resets, and admin reports",
    status: "connected",
    iconName: "smtp",
    isBackendSupported: true,
    details: { Protocol: "TLS Port 587", Sender: "no-reply@qlex.in" },
  },
  {
    id: "oauth",
    name: "Google OAuth 2.0 Identity",
    category: "Authentication",
    description: "Single Sign-On (SSO) integration for staff and student domain logins",
    status: "configuration_required",
    iconName: "oauth",
    isBackendSupported: true,
    details: { Domain: "rit.ac.in", Status: "Client ID required" },
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business Cloud API",
    category: "Messaging",
    description: "Instant token callout and completion message delivery on WhatsApp",
    status: "disconnected",
    iconName: "whatsapp",
    isBackendSupported: true,
    details: { API: "Meta Cloud API v18.0", Status: "Token unconfigured" },
  },
];

function PlatformSettingsPageContent() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsSectionId>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [serverHealthText, setServerHealthText] = useState("FastAPI Connected");
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

  // Popup states
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initial default settings
  const initialSettingsState: FullSettingsState = useMemo(
    () => ({
      general: {
        platformName: "QLex - Central Print Hub",
        supportEmail: "support@qlex.in",
        supportPhone: "+91 98765 43210",
        officialWebsite: "https://qlex.in",
        timezone: "Asia/Kolkata",
        currency: "INR",
        language: "English (US)",
      },
      platform: {
        maintenanceMode: false,
        maintenanceMessage: "QLex is currently under scheduled maintenance. Please try again shortly.",
        platformEnabled: true,
        studentPortalEnabled: true,
        shopPortalEnabled: true,
        adminPortalEnabled: true,
        registrationEnabled: true,
        allowFirstYearPersonalEmail: true,
        newShopRegistration: true,
      },
      orders: {
        allowPriorityOrders: true,
        platformFee: 2,
        priorityFee: 3,
        defaultTokenPrefix: "QX-",
        maxUploadSizeMb: 50,
        maxDocumentsPerOrder: 20,
        maxPagesPerDocument: 1000,
        draftExpiryHours: 24,
        queueTimeoutMinutes: 10,
        allowedFileTypes: ".pdf, .docx, .png, .jpg, .jpeg",
        orderAutoCancelTimeMinutes: 30,
        autoDeleteUploadedFiles: true,
        retentionPeriodDays: 7,
      },
      notifications: {
        emailNotifications: true,
        whatsappNotifications: false,
        pushNotifications: true,
        smsNotifications: false,
        lowSettlementAlert: true,
        paymentFailureAlert: true,
        newShopAlert: true,
        orderFailureAlert: true,
      },
      security: {
        requireEmailVerification: true,
        requireOtp: false,
        passwordMinLength: 8,
        passwordRequireSymbols: true,
        sessionTimeoutMinutes: 60,
        jwtExpiryMinutes: 1440,
        maxLoginAttempts: 5,
        accountLockDurationMinutes: 15,
        enableAuditLogs: true,
      },
      integrations: DEFAULT_INTEGRATIONS,
      appearance: {
        platformTheme: "dark",
        accentColor: "amber",
        logoUrl: "/qlex-logo.png",
        faviconUrl: "/favicon.ico",
      },
      advanced: {
        debugMode: false,
        readOnlyMode: false,
        systemLogsStatus: "INFO: System operating normally. SQLAlchemy DB pool connected. background auto-settlement scheduler active (interval: 30m).",
        apiVersion: "v1.0.0",
        databaseVersion: "PostgreSQL 16 / SQLAlchemy 2.0",
        serverVersion: "FastAPI 0.110.0 (Uvicorn)",
        buildNumber: "2026.07.27-RELEASE",
        environment: "production",
      },
      about: {
        qlexVersion: "3.2.0",
        releaseChannel: "Production Stable",
        lastDeployment: "2026-07-27 18:30 IST",
        backendVersion: "FastAPI 0.110",
        frontendVersion: "Next.js 15.1 (React 19)",
        copyright: "© 2026 QLex Technology Inc. All rights reserved.",
        license: "Commercial Enterprise License",
        poweredBy: "MINDURA TECHNOLOGIES",
      },
    }),
    []
  );

  const [savedState, setSavedState] = useState<FullSettingsState>(initialSettingsState);
  const [draftState, setDraftState] = useState<FullSettingsState>(initialSettingsState);

  // Load backend platform settings
  const fetchSettingsFromBackend = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [backendSettings, health] = await Promise.all([
        getBackendPlatformSettings().catch((err) => {
          console.warn("Backend platform settings fetch fallback:", err);
          return null;
        }),
        getServerHealthInfo().catch((err) => {
          console.warn("Backend server health fallback:", err);
          return null;
        }),
      ]);

      if (health) {
        setIsBackendHealthy(health.status === "HEALTHY");
        setServerHealthText(`FastAPI (${health.status})`);
      }

      if (backendSettings) {
        setSavedState((prev) => {
          const updated: FullSettingsState = {
            general: backendSettings.general ? { ...prev.general, ...backendSettings.general } : prev.general,
            platform: {
              ...prev.platform,
              ...(backendSettings.platform || {}),
              maintenanceMode: backendSettings.maintenance_mode,
              platformEnabled: backendSettings.allow_new_orders,
              allowFirstYearPersonalEmail: backendSettings.allow_first_year_personal_email ?? true,
            },
            orders: {
              ...prev.orders,
              ...(backendSettings.orders || {}),
              platformFee: backendSettings.platform_fee,
              priorityFee: backendSettings.priority_fee,
              maxDocumentsPerOrder: backendSettings.max_documents_per_order,
              maxUploadSizeMb: backendSettings.max_upload_size_mb,
              maxPagesPerDocument: backendSettings.max_pages_per_document,
              draftExpiryHours: backendSettings.draft_expiry_hours,
              queueTimeoutMinutes: backendSettings.queue_timeout_minutes,
            },
            notifications: backendSettings.notifications ? { ...prev.notifications, ...backendSettings.notifications } : prev.notifications,
            security: backendSettings.security ? { ...prev.security, ...backendSettings.security } : prev.security,
            integrations: backendSettings.integrations && backendSettings.integrations.length > 0 ? backendSettings.integrations : prev.integrations,
            appearance: backendSettings.appearance ? { ...prev.appearance, ...backendSettings.appearance } : prev.appearance,
            advanced: backendSettings.advanced ? { ...prev.advanced, ...backendSettings.advanced } : prev.advanced,
            about: backendSettings.about ? { ...prev.about, ...backendSettings.about } : prev.about,
          };
          setDraftState(updated);
          return updated;
        });
      }
    } catch (err: any) {
      setErrorPopupMessage(err?.message || "Failed to load platform settings from backend server.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSettingsFromBackend();
  }, [fetchSettingsFromBackend]);

  // Calculate modified sections & total modified count
  const { modifiedSections, modifiedCount, isDirty } = useMemo(() => {
    const sections = new Set<SettingsSectionId>();
    let count = 0;

    const checkDiff = (sectionKey: keyof FullSettingsState, secId: SettingsSectionId) => {
      const savedSec = savedState[sectionKey] as any;
      const draftSec = draftState[sectionKey] as any;

      if (Array.isArray(savedSec) && Array.isArray(draftSec)) {
        if (JSON.stringify(savedSec) !== JSON.stringify(draftSec)) {
          sections.add(secId);
          count += 1;
        }
      } else if (typeof savedSec === "object" && savedSec !== null) {
        Object.keys(savedSec).forEach((k) => {
          if (savedSec[k] !== draftSec[k]) {
            sections.add(secId);
            count += 1;
          }
        });
      }
    };

    checkDiff("general", "general");
    checkDiff("platform", "platform");
    checkDiff("orders", "orders");
    checkDiff("notifications", "notifications");
    checkDiff("security", "security");
    checkDiff("integrations", "integrations");
    checkDiff("appearance", "appearance");

    return {
      modifiedSections: sections,
      modifiedCount: count,
      isDirty: count > 0,
    };
  }, [savedState, draftState]);

  // Reset form to saved backend state
  const handleReset = () => {
    setDraftState(savedState);
  };

  // Save changes to backend
  const handleSaveConfirmed = async () => {
    setShowConfirmPopup(false);
    setIsSaving(true);

    try {
      const payload: BackendPlatformSettings = {
        platform_fee: draftState.orders.platformFee,
        priority_fee: draftState.orders.priorityFee,
        max_documents_per_order: draftState.orders.maxDocumentsPerOrder,
        max_upload_size_mb: draftState.orders.maxUploadSizeMb,
        max_pages_per_document: draftState.orders.maxPagesPerDocument,
        draft_expiry_hours: draftState.orders.draftExpiryHours,
        queue_timeout_minutes: draftState.orders.queueTimeoutMinutes,
        allow_new_orders: draftState.platform.platformEnabled,
        maintenance_mode: draftState.platform.maintenanceMode,
        allow_first_year_personal_email: draftState.platform.allowFirstYearPersonalEmail,
        general: draftState.general,
        platform: draftState.platform,
        orders: draftState.orders,
        notifications: draftState.notifications,
        security: draftState.security,
        integrations: draftState.integrations,
        appearance: draftState.appearance,
        advanced: draftState.advanced,
        about: draftState.about,
      };

      const updatedBackend = await updateBackendPlatformSettings(payload);

      const finalState: FullSettingsState = {
        general: updatedBackend.general ? { ...draftState.general, ...updatedBackend.general } : draftState.general,
        platform: {
          ...draftState.platform,
          ...(updatedBackend.platform || {}),
          maintenanceMode: updatedBackend.maintenance_mode,
          platformEnabled: updatedBackend.allow_new_orders,
          allowFirstYearPersonalEmail: updatedBackend.allow_first_year_personal_email ?? draftState.platform.allowFirstYearPersonalEmail,
        },
        orders: {
          ...draftState.orders,
          ...(updatedBackend.orders || {}),
          platformFee: updatedBackend.platform_fee,
          priorityFee: updatedBackend.priority_fee,
          maxDocumentsPerOrder: updatedBackend.max_documents_per_order,
          maxUploadSizeMb: updatedBackend.max_upload_size_mb,
          maxPagesPerDocument: updatedBackend.max_pages_per_document,
          draftExpiryHours: updatedBackend.draft_expiry_hours,
          queueTimeoutMinutes: updatedBackend.queue_timeout_minutes,
        },
        notifications: updatedBackend.notifications ? { ...draftState.notifications, ...updatedBackend.notifications } : draftState.notifications,
        security: updatedBackend.security ? { ...draftState.security, ...updatedBackend.security } : draftState.security,
        integrations: updatedBackend.integrations && updatedBackend.integrations.length > 0 ? updatedBackend.integrations : draftState.integrations,
        appearance: updatedBackend.appearance ? { ...draftState.appearance, ...updatedBackend.appearance } : draftState.appearance,
        advanced: updatedBackend.advanced ? { ...draftState.advanced, ...updatedBackend.advanced } : draftState.advanced,
        about: updatedBackend.about ? { ...draftState.about, ...updatedBackend.about } : draftState.about,
      };

      setSavedState(finalState);
      setDraftState(finalState);
      setShowSuccessPopup(true);
    } catch (err: any) {
      setErrorPopupMessage(err?.message || "Failed to update platform settings on backend.");
    } finally {
      setIsSaving(false);
    }
  };

  // Global search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const q = searchQuery.toLowerCase();

    const matches: { secId: SettingsSectionId; label: string; matches: string[] }[] = [];

    SETTINGS_SECTIONS.forEach((sec) => {
      const found: string[] = [];
      if (sec.label.toLowerCase().includes(q) || sec.desc.toLowerCase().includes(q)) {
        found.push(`Section: ${sec.label}`);
      }

      // Check fields inside section
      if (sec.id === "general") {
        Object.entries(draftState.general).forEach(([k, v]) => {
          if (k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)) {
            found.push(`${k}: ${v}`);
          }
        });
      } else if (sec.id === "platform") {
        Object.entries(draftState.platform).forEach(([k, v]) => {
          if (k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)) {
            found.push(`${k}`);
          }
        });
      } else if (sec.id === "orders") {
        Object.entries(draftState.orders).forEach(([k, v]) => {
          if (k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)) {
            found.push(`${k}`);
          }
        });
      } else if (sec.id === "notifications") {
        Object.entries(draftState.notifications).forEach(([k, v]) => {
          if (k.toLowerCase().includes(q)) found.push(`${k}`);
        });
      } else if (sec.id === "security") {
        Object.entries(draftState.security).forEach(([k, v]) => {
          if (k.toLowerCase().includes(q)) found.push(`${k}`);
        });
      } else if (sec.id === "integrations") {
        draftState.integrations.forEach((item) => {
          if (item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)) {
            found.push(`Integration: ${item.name}`);
          }
        });
      }

      if (found.length > 0) {
        matches.push({ secId: sec.id, label: sec.label, matches: found });
      }
    });

    return matches;
  }, [searchQuery, draftState]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030406] text-white">
        <SettingsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isBackendHealthy={isBackendHealthy}
          serverStatusText={serverHealthText}
        />
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030406] text-white selection:bg-amber-500/30 selection:text-amber-200">
      {/* Sticky Top Header */}
      <SettingsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isBackendHealthy={isBackendHealthy}
        serverStatusText={serverHealthText}
        isRefreshing={isRefreshing}
        onRefresh={fetchSettingsFromBackend}
      />

      {/* Main Layout Container */}
      <main className="max-w-[1300px] mx-auto p-4 md:p-6 lg:p-8">
        {/* Global Search Results Dropdown/Notice */}
        {searchResults && (
          <div className="mb-6 p-4 rounded-2xl bg-[#070a0e]/80 border border-amber-500/30 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search results for &quot;{searchQuery}&quot; ({searchResults.length} matching sections)</span>
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-white text-[11px] underline"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 space-y-2">
                <p className="text-xs">No settings found matching &quot;{searchQuery}&quot;.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all"
                >
                  Reset Search Filter
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {searchResults.map((res) => (
                  <button
                    key={res.secId}
                    onClick={() => {
                      setActiveTab(res.secId);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
                  >
                    <span>{res.label}</span>
                    <span className="text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded-full text-amber-200 font-bold">
                      {res.matches.length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sticky Sidebar */}
          <div className="lg:col-span-3">
            <SettingsSidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              modifiedSections={modifiedSections}
            />
          </div>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-9 space-y-6">
            {activeTab === "general" && (
              <GeneralSettings
                data={draftState.general}
                onChange={(up) =>
                  setDraftState((prev) => ({
                    ...prev,
                    general: { ...prev.general, ...up },
                  }))
                }
              />
            )}

            {activeTab === "platform" && (
              <PlatformSettingsTab
                data={draftState.platform}
                onChange={(up) =>
                  setDraftState((prev) => ({
                    ...prev,
                    platform: { ...prev.platform, ...up },
                  }))
                }
              />
            )}

            {activeTab === "orders" && (
              <OrderSettingsTab
                data={draftState.orders}
                onChange={(up) =>
                  setDraftState((prev) => ({
                    ...prev,
                    orders: { ...prev.orders, ...up },
                  }))
                }
              />
            )}

            {activeTab === "notifications" && (
              <NotificationSettingsTab
                data={draftState.notifications}
                onChange={(up) =>
                  setDraftState((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, ...up },
                  }))
                }
              />
            )}

            {activeTab === "security" && (
              <SecuritySettingsTab
                data={draftState.security}
                onChange={(up) =>
                  setDraftState((prev) => ({
                    ...prev,
                    security: { ...prev.security, ...up },
                  }))
                }
              />
            )}

            {activeTab === "integrations" && (
              <IntegrationSettingsTab
                integrations={draftState.integrations}
                onChange={(updated) =>
                  setDraftState((prev) => ({
                    ...prev,
                    integrations: updated,
                  }))
                }
              />
            )}

            {activeTab === "appearance" && (
              <AppearanceSettingsTab
                data={draftState.appearance}
                onChange={(up) =>
                  setDraftState((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, ...up },
                  }))
                }
              />
            )}

            {activeTab === "advanced" && <AdvancedSettingsTab data={draftState.advanced} />}

            {activeTab === "about" && <AboutSectionTab data={draftState.about} />}
          </div>
        </div>
      </main>

      {/* Sticky Save Bar */}
      <StickySaveBar
        isDirty={isDirty}
        modifiedCount={modifiedCount}
        isSaving={isSaving}
        onSave={() => setShowConfirmPopup(true)}
        onReset={handleReset}
      />

      {/* Confirmation Popup */}
      <Popup
        open={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        title="Confirm Settings Update"
        description="You are about to update platform configuration on the live QLex backend server."
        icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
        variant="warning"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            Modifying these parameters will instantly affect active student orders, vendor terminals, and queue behavior.
          </p>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <span className="font-bold">Modified Fields ({modifiedCount}):</span>
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-[11px] text-amber-300 font-mono">
              {Array.from(modifiedSections).map((sec) => (
                <li key={sec} className="capitalize">
                  Section: {sec}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowConfirmPopup(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfirmed}
              className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              Confirm & Apply Settings
            </button>
          </div>
        </div>
      </Popup>

      {/* Success Popup */}
      <Popup
        open={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Settings Updated Successfully"
        description="Platform parameters have been committed to the FastAPI database."
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        variant="success"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            All vendor print shops and student queue monitors are now running with the updated platform configuration.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </Popup>

      {/* Error Popup */}
      <Popup
        open={!!errorPopupMessage}
        onClose={() => setErrorPopupMessage(null)}
        title="Error Updating Settings"
        description="An issue occurred while communicating with the backend API."
        icon={<ShieldAlert className="h-5 w-5 text-rose-400" />}
        variant="error"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-mono">
            {errorPopupMessage}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setErrorPopupMessage(null);
                fetchSettingsFromBackend();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => setErrorPopupMessage(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
}

export default function PlatformSettingsPage() {
  return (
    <AdminProtectedRoute>
      <PlatformSettingsPageContent />
    </AdminProtectedRoute>
  );
}


