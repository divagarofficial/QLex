import type { Metadata } from "next";
import ShopPricingPage from "@/components/shop/pricing/ShopPricingPage";

export const metadata: Metadata = {
  title: "Pricing Settings — QLex Shop",
  description: "Configure printing charges, platform fees, and additional services for QLex shop.",
};

export default function Page() {
  return <ShopPricingPage />;
}
