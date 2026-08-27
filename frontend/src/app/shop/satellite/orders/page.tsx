import type { Metadata } from "next";
import SatelliteShopOrdersPage from "@/components/shop/satellite/SatelliteShopOrdersPage";

export const metadata: Metadata = {
  title: "Satellite Orders — QLex Satellite Print Hub",
  description: "Operational workbench for processing Staff print orders at Satellite Hub A103.",
};

export default function Page() {
  return <SatelliteShopOrdersPage />;
}
