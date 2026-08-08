import type { Metadata } from "next";
import ShopDashboard from "@/components/shop/ShopDashboard";

export const metadata: Metadata = {
  title: "Shop Dashboard — QLex",
  description: "Operations Center & Print Dispatch for QLex Shop Operators.",
};

export default function Page() {
  return <ShopDashboard />;
}
