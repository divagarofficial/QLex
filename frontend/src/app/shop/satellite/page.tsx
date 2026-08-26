import type { Metadata } from "next";
import ShopDashboard from "@/components/shop/ShopDashboard";

export const metadata: Metadata = {
  title: "QLex Satellite Print Hub — Shop Dashboard",
  description: "Operations Center for QLex Satellite Print Hub (Faculty & Staff Terminal).",
};

export default function SatelliteShopDashboardPage() {
  return <ShopDashboard defaultHub="QLex Satellite Print Hub" />;
}
