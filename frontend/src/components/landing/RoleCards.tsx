"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Store, GraduationCap } from "lucide-react";
import RoleCard from "./RoleCard";

const cards = [
  {
    title: "Administrator",
    badge: "System Operations",
    description: "Manage platform, students, print shops, analytics and payments.",
    icon: ShieldCheck,
    accent: "blue" as const,
    href: "/admin/login",
  },
  {
    title: "Print Shop",
    badge: "Queue & Print Ops",
    description: "Receive orders, manage queue, print documents and complete collections.",
    icon: Store,
    accent: "gold" as const,
    href: "/shop/login",
  },
  {
    title: "Student",
    badge: "Upload & Live Token",
    description: "Upload documents, customize printing, pay online and collect your order.",
    icon: GraduationCap,
    accent: "violet" as const,
    href: "/student/login",
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
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8"
    >
      {cards.map((card) => (
        <motion.div key={card.title} variants={item} className="h-full">
          <RoleCard {...card} />
        </motion.div>
      ))}
    </motion.div>
  );
}

