import type { Metadata } from "next";
import SatelliteShopDashboard from "@/components/shop/SatelliteShopDashboard";

export const metadata: Metadata = {
  title: "QLex Satellite Print Hub — Operations Center",
  description: "Terminal Operations Center for QLex Satellite Print Hub (Faculty & Staff Terminal A103).",
};

export default function SatelliteShopDashboardPage() {
  return <SatelliteShopDashboard />;
}
