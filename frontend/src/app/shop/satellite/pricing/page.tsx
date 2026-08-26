import type { Metadata } from "next";
import SatelliteShopPricingPage from "@/components/shop/satellite/SatelliteShopPricingPage";

export const metadata: Metadata = {
  title: "Staff Quotas & Policy — QLex Satellite Print Hub",
  description: "Institutional staff print policy and departmental allocation rules at Satellite Hub.",
};

export default function Page() {
  return <SatelliteShopPricingPage />;
}
