import type { Metadata } from "next";
import SatelliteShopDashboard from "@/components/shop/SatelliteShopDashboard";

export const metadata: Metadata = {
  title: "QLex Satellite Print Hub",
  description: "QLex Satellite Print Hub (A103, Department of Artificial Intelligence and Data Science, First Floor, A Block).",
};

export default function SatelliteShopDashboardPage() {
  return <SatelliteShopDashboard />;
}
