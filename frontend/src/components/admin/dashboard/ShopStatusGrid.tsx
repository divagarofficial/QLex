"use client";

import { motion } from "framer-motion";
import { Store } from "lucide-react";
import ShopCard from "./ShopCard";
import type { AdminShopItem } from "@/services/adminDashboard";

interface ShopStatusGridProps {
  shops: AdminShopItem[];
}

export default function ShopStatusGrid({ shops }: ShopStatusGridProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Registered Print Shops</h2>
          </div>
          <p className="text-xs text-zinc-400">Live operation and health stats per print facility</p>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="deep-glass p-8 rounded-3xl text-center border border-white/10">
          <p className="text-sm font-medium text-zinc-400">No print shops currently registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard key={shop.shop_id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
