import type { Metadata } from "next";
import SatelliteShopQueuePage from "@/components/shop/satellite/SatelliteShopQueuePage";

export const metadata: Metadata = {
  title: "Live S-Queue — QLex Satellite Print Hub",
  description: "Sequential S-Token queue management for Staff print jobs.",
};

export default function Page() {
  return <SatelliteShopQueuePage />;
}
