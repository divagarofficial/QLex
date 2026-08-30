"use client";

import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CreditsHeader from "@/components/credits/CreditsHeader";
import BrandSection from "@/components/credits/BrandSection";
import ImpactStatsSection from "@/components/credits/ImpactStatsSection";
import TrademarkSection from "@/components/credits/TrademarkSection";
import CoreTeamSection from "@/components/credits/CoreTeamSection";
import ProductInfoCard from "@/components/credits/ProductInfoCard";
import TechnologyStack from "@/components/credits/TechnologyStack";
import SpecialThanks from "@/components/credits/SpecialThanks";
import VisionSection from "@/components/credits/VisionSection";
import FooterSection from "@/components/credits/FooterSection";

// Stagger animation container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const easeCurve = [0.16, 1, 0.3, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: easeCurve,
    },
  },
};

export default function CreditsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen relative overflow-hidden bg-[#030406] text-white px-4 sm:px-6 py-8 sm:py-14">
        {/* Environmental Ambient Background Lighting Beams */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-radial from-amber-500/12 via-amber-300/5 to-transparent blur-3xl opacity-60" />
        <div className="pointer-events-none absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl opacity-40" />
        <div className="pointer-events-none absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl opacity-30" />

        {/* 900px Max Content Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-[900px] w-full mx-auto space-y-16 sm:space-y-20 md:space-y-24 text-center"
        >
          {/* Header */}
          <motion.div variants={sectionVariants}>
            <CreditsHeader />
          </motion.div>

          {/* Section 1: QLex Identity */}
          <motion.div variants={sectionVariants}>
            <BrandSection />
          </motion.div>

          {/* Section 2: Impact Metrics */}
          <motion.div variants={sectionVariants}>
            <ImpactStatsSection />
          </motion.div>

          {/* Section 3: Company Information (Trademark) */}
          <motion.div variants={sectionVariants}>
            <TrademarkSection />
          </motion.div>

          {/* Section 4: Core Team (Heart & Soul) */}
          <motion.div variants={sectionVariants}>
            <CoreTeamSection />
          </motion.div>

          {/* Section 5: Technology Stack */}
          <motion.div variants={sectionVariants}>
            <TechnologyStack />
          </motion.div>

          {/* Section 6: Product Information */}
          <motion.div variants={sectionVariants}>
            <ProductInfoCard />
          </motion.div>

          {/* Section 7: Special Thanks */}
          <motion.div variants={sectionVariants}>
            <SpecialThanks />
          </motion.div>

          {/* Section 8: Vision & Pillars */}
          <motion.div variants={sectionVariants}>
            <VisionSection />
          </motion.div>

          {/* Section 9: Copyright */}
          <motion.div variants={sectionVariants}>
            <FooterSection />
          </motion.div>
        </motion.div>
      </main>
    </ProtectedRoute>
  );
}

