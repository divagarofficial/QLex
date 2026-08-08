"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ShoppingBag, Tag, Landmark, ArrowRight } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Live Queue",
      description: "Manage queue positions and sequence",
      icon: Users,
      href: "/shop/queue",
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "hover:border-blue-400/50",
      textColor: "text-blue-300",
    },
    {
      title: "Orders List",
      description: "Search, filter and inspect all orders",
      icon: ShoppingBag,
      href: "/shop/orders",
      color: "from-amber-500/20 to-yellow-500/20",
      borderColor: "hover:border-amber-400/50",
      textColor: "text-amber-300",
    },
    {
      title: "Pricing Matrix",
      description: "Configure per-page printing costs",
      icon: Tag,
      href: "/shop/pricing",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "hover:border-purple-400/50",
      textColor: "text-purple-300",
    },
    {
      title: "Settlements",
      description: "View payouts and UPI settlements",
      icon: Landmark,
      href: "/shop/settlements",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "hover:border-emerald-400/50",
      textColor: "text-emerald-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3 + idx * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              href={action.href}
              className={`deep-glass group relative block overflow-hidden rounded-3xl p-5 border border-white/10 ${action.borderColor} shadow-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${action.color} border border-white/10 ${action.textColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
              </div>

              <div className="mt-4">
                <h4 className="text-base font-bold text-white tracking-tight">
                  {action.title}
                </h4>
                <p className="mt-1 text-xs text-zinc-400 font-medium">
                  {action.description}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
