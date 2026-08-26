"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Store, GraduationCap, UserCheck } from "lucide-react";
import RoleCard from "./RoleCard";
import ShopHubSelectionModal from "./ShopHubSelectionModal";

const cards = [
  {
    id: "admin",
    title: "Administrator",
    badge: "System Operations",
    description: "Manage platform, students, print shops, analytics and payments.",
    icon: ShieldCheck,
    accent: "blue" as const,
    href: "/admin/login",
  },
  {
    id: "shop",
    title: "Print Shop",
    badge: "Print Hub Portal",
    description: "Select QLex Central Print Hub or QLex Satellite Print Hub to process print jobs.",
    icon: Store,
    accent: "gold" as const,
    href: "/shop/login",
  },
  {
    id: "student",
    title: "Student",
    badge: "Upload & Live Token",
    description: "Upload documents, customize printing, pay online and collect your order.",
    icon: GraduationCap,
    accent: "violet" as const,
    href: "/student/login",
  },
  {
    id: "staff",
    title: "Faculty & Staff",
    badge: "Satellite Print Hub",
    description: "Instant document printing at QLex Satellite Print Hub. Free institutional staff printing.",
    icon: UserCheck,
    accent: "emerald" as const,
    href: "/staff/login",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function RoleCards() {
  const [showShopModal, setShowShopModal] = useState(false);

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-6"
      >
        {cards.map((card) => (
          <motion.div key={card.title} variants={item} className="h-full">
            <RoleCard
              {...card}
              onClick={card.id === "shop" ? () => setShowShopModal(true) : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Shop Terminal Selection Popup Modal */}
      <ShopHubSelectionModal
        open={showShopModal}
        onClose={() => setShowShopModal(false)}
      />
    </>
  );
}

