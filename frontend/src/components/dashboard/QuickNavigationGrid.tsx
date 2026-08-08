"use client";

import {
  Upload,
  Ticket,
  ClipboardList,
  Activity,
  Wallet,
  Coins,
} from "lucide-react";
import QuickNavigationCard from "./QuickNavigationCard";

const NAV_ITEMS = [
  {
    icon: <Upload size={22} />,
    title: "New Order",
    description: "Upload documents & select print options",
    route: "/student/new-order",
    badge: "Fast Track",
    badgeColor: "bg-amber-400/15 border-amber-400/40 text-amber-300",
    isPrimary: true,
  },
  {
    icon: <Ticket size={22} />,
    title: "My Token",
    description: "View active queue token & counter status",
    route: "/student/token",
    badge: "Active",
    badgeColor: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  },
  {
    icon: <ClipboardList size={22} />,
    title: "My Orders",
    description: "Track current and past print orders",
    route: "/student/orders",
  },
  {
    icon: <Activity size={22} />,
    title: "Live Queue",
    description: "Real-time campus queue tracker",
    route: "/student/live-queue",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  },
  {
    icon: <Wallet size={22} />,
    title: "Payments",
    description: "View transaction history & receipts",
    route: "/student/payments",
  },
  {
    icon: <Coins size={22} />,
    title: "Credits",
    description: "Platform info, creators & vision",
    route: "/student/credits",
  },
];

export default function QuickNavigationGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {NAV_ITEMS.map((item, index) => (
        <QuickNavigationCard
          key={item.route}
          icon={item.icon}
          title={item.title}
          description={item.description}
          route={item.route}
          index={index}
          badge={item.badge}
          badgeColor={item.badgeColor}
          isPrimary={item.isPrimary}
        />
      ))}
    </div>
  );
}
