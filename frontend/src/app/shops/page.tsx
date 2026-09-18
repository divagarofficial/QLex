"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Building2,
  PlusCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import CompanyHeader from "@/components/landing/CompanyHeader";
import SupportCard from "@/components/common/SupportCard";
import { fetchPublicShops, registerShop, type PublicShop, type ShopRegisterInput } from "@/services/expressOrders";

// Fallback seed shops to display if backend is connecting
const FALLBACK_SHOPS: PublicShop[] = [
  {
    id: "central-hub-01",
    name: "QLex Central Print Hub",
    slug: "rit",
    tagline: "Official College Campus Print Center",
    description: "RIT Campus Road, Opposite to A Block, RIT Main Campus. Manages student priority & regular queue tokens (P- & R-), online payments, settlements, and pricing.",
    address: "RIT Campus Road, Opposite A Block, Main Campus",
    phone: "+91 94440 12345",
    is_express_enabled: false,
    requires_account: true,
    operating_hours: "8:30 AM - 5:30 PM",
  },
  {
    id: "satellite-hub-02",
    name: "QLex Satellite Print Hub",
    slug: "satellite",
    tagline: "High-Speed Faculty & Department Kiosk",
    description: "A103, Department of Artificial Intelligence and Data Science, First Floor, A Block. Manages sequential S- tokens and staff print jobs.",
    address: "A103, Dept of AI & DS, 1st Floor, A Block",
    phone: "+91 94440 54321",
    is_express_enabled: false,
    requires_account: true,
    operating_hours: "8:00 AM - 6:00 PM",
  },
  {
    id: "acme-express-03",
    name: "Acme Express Print Kiosk",
    slug: "acme",
    tagline: "Fast Express Prints • No Login Required",
    description: "Tech Park Gate 2, Commercial Kiosk #1. Zero registration required walk-in kiosk for instant mobile UPI printing.",
    address: "Tech Park Gate 2, Commercial Kiosk #1",
    phone: "+91 98880 54321",
    is_express_enabled: true,
    requires_account: false,
    operating_hours: "8:00 AM - 9:00 PM",
  },
];

export default function ShopsPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"select" | "register">("select");
  
  // Data state
  const [shops, setShops] = useState<PublicShop[]>(FALLBACK_SHOPS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExpressOnly, setFilterExpressOnly] = useState(false);

  // Form state for registration
  const [registerForm, setRegisterForm] = useState<ShopRegisterInput>({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    upi_id: "",
    operating_hours: "8:00 AM - 8:00 PM",
    is_express_enabled: true,
    requires_account: false,
    pin: "0810",
  });


  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Load public shops on mount
  useEffect(() => {
    async function loadShops() {
      try {
        setLoading(true);
        const data = await fetchPublicShops();
        if (data && data.length > 0) {
          // Combine fetched shops with fallback hubs if not already present
          const existingSlugs = new Set(data.map((s) => s.slug));
          const merged = [...data];
          FALLBACK_SHOPS.forEach((fb) => {
            if (!existingSlugs.has(fb.slug)) {
              merged.push(fb);
            }
          });
          setShops(merged);
        }
      } catch (err) {
        console.warn("Could not fetch backend shops, using fallback seed shops:", err);
      } finally {
        setLoading(false);
      }
    }
    loadShops();
  }, []);

  // Handle slug auto-generation as name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    const autoSlug = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setRegisterForm((prev) => ({
      ...prev,
      name: nameVal,
      slug: autoSlug,
    }));
  };

  // Filtered shops list
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesSearch =
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.address && shop.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (shop.tagline && shop.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        shop.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterExpressOnly ? shop.is_express_enabled : true;

      return matchesSearch && matchesFilter;
    });
  }, [shops, searchQuery, filterExpressOnly]);

  // Proceed to shop dashboard (verifying 4-digit PIN first)
  const handleSelectShop = (shop: PublicShop) => {
    try {
      localStorage.setItem("qlex_active_shop_slug", shop.slug);
      localStorage.setItem("qlex_active_shop_name", shop.name);
    } catch {}

    const storedToken = typeof window !== "undefined" ? localStorage.getItem("qlex_shop_token") : null;
    const storedSlug = typeof window !== "undefined" ? localStorage.getItem("qlex_shop_slug") : null;

    // Check if operator is authenticated for this specific shop
    const isAuthedForShop = Boolean(storedToken && storedSlug === shop.slug);

    if (isAuthedForShop) {
      if (shop.slug === "rit" || shop.slug === "central") {
        router.push("/shop/dashboard");
      } else if (shop.slug === "satellite") {
        router.push("/shop/satellite");
      } else {
        router.push(`/shop/${shop.slug}/dashboard`);
      }
    } else {
      // Flagship college hubs use official college portal login
      if (shop.slug === "rit" || shop.slug === "central") {
        router.push("/shop/login?hub=central");
      } else if (shop.slug === "satellite") {
        router.push("/shop/login?hub=satellite");
      } else {
        // All non-college shops use their dedicated shop PIN login screen
        router.push(`/shop/${encodeURIComponent(shop.slug)}/login`);
      }
    }
  };




  // Submit shop registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!registerForm.name.trim()) {
      setFormError("Please enter a valid Shop Name.");
      return;
    }

    if (!registerForm.pin || registerForm.pin.length !== 4) {
      setFormError("Operator Access PIN must be exactly 4 numeric digits.");
      return;
    }


    try {
      setSubmitting(true);
      const createdShop = await registerShop(registerForm);
      
      setFormSuccess(`Shop "${createdShop.name}" successfully registered! Redirecting to dashboard...`);
      
      // Store new shop and update state
      setShops((prev) => [createdShop, ...prev]);

      // Automatically proceed to newly registered shop's dashboard
      setTimeout(() => {
        handleSelectShop(createdShop);
      }, 1200);

    } catch (err: any) {
      setFormError(err.message || "Failed to register shop. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04060a] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Radial Ambient Glows */}
      <div className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />

      {/* Main Header */}
      <CompanyHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Title Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>QLex Scalable Multi-Shop Network</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Print Shop Directory & Onboarding
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
            Select an existing print hub to enter operations, or register a new shop to launch your own automated queue & express printing workbench.
          </p>

          {/* Tab Switcher Controls */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-lg">
            <button
              onClick={() => setActiveTab("select")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "select"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Select Shop & Continue</span>
            </button>

            <button
              onClick={() => setActiveTab("register")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Register New Shop</span>
            </button>
          </div>
        </div>

        {/* Tab Content Section */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            {activeTab === "select" ? (
              /* TAB 1: SELECT SHOP & CONTINUE */
              <motion.div
                key="tab-select"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search by shop name, address, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setFilterExpressOnly(!filterExpressOnly)}
                      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                        filterExpressOnly
                          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-black/30 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>Express Enabled Only</span>
                    </button>

                    <div className="text-xs text-zinc-400">
                      Showing <strong className="text-white">{filteredShops.length}</strong> shops
                    </div>
                  </div>
                </div>

                {/* Shop Cards Grid */}
                {filteredShops.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
                    <Store className="mx-auto h-12 w-12 text-zinc-600" />
                    <h3 className="mt-4 text-lg font-bold text-white">No Shops Found</h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      No print hubs match your search query "{searchQuery}". Try clearing filters or register your shop!
                    </p>
                    <button
                      onClick={() => setActiveTab("register")}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Register New Shop</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShops.map((shop) => {
                      const isFlagshipCentral = shop.slug === "rit" || shop.slug === "central";
                      const isFlagshipSatellite = shop.slug === "satellite";

                      return (
                        <motion.div
                          key={shop.id || shop.slug}
                          whileHover={{ y: -4, scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all shadow-xl ${
                            isFlagshipCentral
                              ? "border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-slate-900/80 to-black/90 shadow-amber-500/5"
                              : isFlagshipSatellite
                              ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/80 to-black/90 shadow-emerald-500/5"
                              : "border-white/10 bg-gradient-to-b from-white/5 via-slate-900/60 to-black/80 hover:border-amber-500/30"
                          }`}
                        >
                          <div>
                            {/* Badges Header */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                                    isFlagshipCentral
                                      ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                      : isFlagshipSatellite
                                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                      : "bg-white/10 border-white/15 text-zinc-300"
                                  }`}
                                >
                                  {isFlagshipSatellite ? (
                                    <Building2 className="h-5 w-5" />
                                  ) : (
                                    <Store className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                                    {shop.slug}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active Hub
                                  </span>
                                </div>
                              </div>

                              {isFlagshipCentral && (
                                <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase">
                                  College Central
                                </span>
                              )}
                              {isFlagshipSatellite && (
                                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 uppercase">
                                  College Satellite
                                </span>
                              )}
                            </div>

                            {/* Shop Name & Tagline */}
                            <h3 className="mt-4 text-xl font-extrabold text-white tracking-tight">
                              {shop.name}
                            </h3>
                            {shop.tagline && (
                              <p className="mt-1 text-xs font-semibold text-amber-300/90">
                                {shop.tagline}
                              </p>
                            )}
                            {shop.description && (
                              <p className="mt-2 text-xs leading-relaxed text-zinc-400 line-clamp-3">
                                {shop.description}
                              </p>
                            )}

                            {/* Details List */}
                            <div className="mt-4 space-y-2 text-xs text-zinc-300 border-t border-white/10 pt-3">
                              {shop.address && (
                                <div className="flex items-start gap-2 text-zinc-400">
                                  <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{shop.address}</span>
                                </div>
                              )}
                              {shop.operating_hours && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                  <span>{shop.operating_hours}</span>
                                </div>
                              )}
                            </div>

                            {/* Feature Chips */}
                            <div className="mt-4 flex flex-wrap items-center gap-1.5">
                              {shop.is_express_enabled ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                  <Zap className="h-3 w-3 text-emerald-400" />
                                  Express Kiosk
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                                  Standard Queue
                                </span>
                              )}

                              {shop.requires_account ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                  <ShieldCheck className="h-3 w-3 text-amber-400" />
                                  Account Required
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                                  No-Login Kiosk
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => handleSelectShop(shop)}
                            className="mt-6 flex items-center justify-between w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-extrabold text-white hover:bg-amber-500 hover:text-slate-950 transition-all group cursor-pointer"
                          >
                            <span>Continue to Shop Dashboard</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              /* TAB 2: REGISTER NEW SHOP */
              <motion.div
                key="tab-register"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Form Column */}
                <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b0f17] to-[#04060a] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white sm:text-2xl">Register Your Print Shop</h2>
                      <p className="text-xs text-zinc-400">Expand your operations with automated queueing & UPI express print fulfillment.</p>
                    </div>
                  </div>

                  {formError && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Shop Name <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Metro Digital Press"
                          value={registerForm.name}
                          onChange={handleNameChange}
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Unique URL Slug
                        </label>
                        <input
                          type="text"
                          placeholder="auto-generated slug e.g. metro-digital"
                          value={registerForm.slug || ""}
                          onChange={(e) => setRegisterForm({ ...registerForm, slug: e.target.value.toLowerCase() })}
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-amber-300 font-mono placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                        Short Tagline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. High-Speed Architectural & Document Printing Kiosk"
                        value={registerForm.tagline || ""}
                        onChange={(e) => setRegisterForm({ ...registerForm, tagline: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                        Shop Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Describe services offered, paper stock availability, bound formats, etc."
                        value={registerForm.description || ""}
                        onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    {/* Contact & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Shop Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={registerForm.phone || ""}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          UPI VPA ID (For Direct Payouts)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. metroprints@upi"
                          value={registerForm.upi_id || ""}
                          onChange={(e) => setRegisterForm({ ...registerForm, upi_id: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                        Full Address / Kiosk Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Counter #4, Tech Hub Complex, MG Road"
                        value={registerForm.address || ""}
                        onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    {/* 4-Digit Operator PIN Setup */}
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <label className="block text-xs font-bold text-amber-300 mb-1">
                        Operator Access PIN (4 Digits) <span className="text-amber-400">*</span>
                      </label>
                      <p className="text-[11px] text-zinc-400 mb-2.5">
                        Set a secret 4-digit PIN for logging into your shop operator dashboard terminal.
                      </p>
                      <input
                        type="text"
                        maxLength={4}
                        required
                        placeholder="0810"
                        value={registerForm.pin || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setRegisterForm({ ...registerForm, pin: val });
                        }}
                        className="w-36 rounded-xl border border-amber-400/40 bg-black/70 px-3.5 py-2 text-base font-mono text-amber-300 tracking-widest text-center focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    {/* Feature Checkboxes */}

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={registerForm.is_express_enabled}
                          onChange={(e) => setRegisterForm({ ...registerForm, is_express_enabled: e.target.checked })}
                          className="h-4 w-4 rounded border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">Enable Express Walk-in Printing</span>
                          <span className="text-[11px] text-zinc-400">Allows guest customers to upload and pay via mobile UPI without logging in.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-white/5">
                        <input
                          type="checkbox"
                          checked={registerForm.requires_account}
                          onChange={(e) => setRegisterForm({ ...registerForm, requires_account: e.target.checked })}
                          className="h-4 w-4 rounded border-zinc-700 bg-black text-amber-500 focus:ring-amber-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">Require Account Login</span>
                          <span className="text-[11px] text-zinc-400">Restricts orders to logged-in registered students or faculty users.</span>
                        </div>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-extrabold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                          <span>Registering Shop & Initializing Dashboard...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-slate-950" />
                          <span>Register Shop & Proceed to Dashboard</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>Live Directory Card Preview</span>
                    </h3>

                    <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/80 to-black p-5 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <Store className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-amber-300 uppercase block">
                              /shop/{registerForm.slug || "your-slug"}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400">New Print Hub</span>
                          </div>
                        </div>
                      </div>

                      <h4 className="mt-3 text-lg font-bold text-white">
                        {registerForm.name || "Your Shop Name"}
                      </h4>
                      <p className="mt-1 text-xs text-amber-300">
                        {registerForm.tagline || "Shop tagline preview..."}
                      </p>
                      <p className="mt-2 text-xs text-zinc-400 line-clamp-2">
                        {registerForm.description || "Shop description preview..."}
                      </p>

                      <div className="mt-4 space-y-1.5 text-xs text-zinc-400 border-t border-white/10 pt-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{registerForm.address || "Shop Address..."}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{registerForm.operating_hours}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <SupportCard />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
