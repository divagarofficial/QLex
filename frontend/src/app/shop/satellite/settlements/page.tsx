import type { Metadata } from "next";
import SatelliteShopSettlementsPage from "@/components/shop/satellite/SatelliteShopSettlementsPage";

export const metadata: Metadata = {
  title: "Usage Audit Ledger — QLex Satellite Print Hub",
  description: "Departmental staff print ledger and usage audit logs at Satellite Hub.",
};

export default function Page() {
  return <SatelliteShopSettlementsPage />;
}
