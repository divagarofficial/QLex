"use client";

import { motion } from "framer-motion";
import {
  Users,
  Store,
  FileText,
  CreditCard,
  Receipt,
  Tag,
  BarChart3,
  FileSpreadsheet,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    { title: "Students", href: "/admin/students", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Shops", href: "/admin/shops", icon: Store, color: "text-amber-400", bg: "bg-amber-500/10" },
    { title: "Orders", href: "/admin/orders", icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { title: "Payments", href: "/admin/payments", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Settlements", href: "/admin/settlements", icon: Receipt, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { title: "Pricing", href: "/admin/pricing", icon: Tag, color: "text-violet-400", bg: "bg-violet-500/10" },
    { title: "Reports", href: "/admin/reports", icon: FileSpreadsheet, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3, color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Quick Shortcuts</h2>
        <p className="text-xs text-zinc-400">Direct navigation to dedicated administration modules</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {actions.map((act) => (
          <Link key={act.title} href={act.href}>
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div
                className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 ${act.bg} backdrop-blur-md transition-transform group-hover:scale-110`}
              >
                <act.icon className={`h-5 w-5 ${act.color}`} />
              </div>
              <span className="text-xs font-bold text-white leading-tight">{act.title}</span>
              <ArrowUpRight className="absolute top-2 right-2 h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
