"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  FileText,
  CreditCard,
  Receipt,
  Tag,
  Settings,
  Shield,
  Activity,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  serverStatus?: string;
  databaseStatus?: string;
}

const navItems = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Students", href: "/admin/students", icon: Users, badge: "Users" },
  { name: "Shops Hub", href: "/admin/shops", icon: Store, badge: "Live" },
  { name: "Print Orders", href: "/admin/orders", icon: FileText },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Settlements", href: "/admin/settlements", icon: Receipt },
  { name: "Pricing Config", href: "/admin/pricing", icon: Tag },
  { name: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export default function DashboardSidebar({
  serverStatus = "HEALTHY",
  databaseStatus = "CONNECTED",
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col shrink-0 border-r border-white/10 bg-[#030406]/60 backdrop-blur-xl min-h-[calc(100vh-61px)] p-4 select-none">
      {/* Navigation Group Header */}
      <div className="mb-2 px-3">
        <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">
          Admin Management
        </p>
      </div>

      {/* Main Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-white border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    isActive ? "text-blue-400" : "text-zinc-400 group-hover:text-white"
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    isActive
                      ? "bg-blue-500/30 text-blue-300"
                      : "bg-white/10 text-zinc-400 group-hover:bg-white/20 group-hover:text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer Card */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              <span>Platform Engine</span>
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="space-y-1.5 text-[10px] text-zinc-400 font-medium">
            <div className="flex justify-between items-center">
              <span>Server API:</span>
              <span className="text-emerald-400 font-bold tracking-wide">{serverStatus}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database:</span>
              <span className="text-cyan-400 font-bold tracking-wide">{databaseStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
