import type { Metadata } from "next";
import NonCollegeShopPricingPage from "@/components/shop/NonCollegeShopPricingPage";
import ShopPricingPage from "@/components/shop/pricing/ShopPricingPage";

export const metadata: Metadata = {
  title: "Shop Rate Card & Pricing — QLex Platform",
  description: "Configure rate card and pricing for shop.",
};

interface PageProps {
  params: Promise<{ shopSlug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.shopSlug?.toLowerCase() || "rit";

  if (slug === "rit" || slug === "central" || slug === "satellite") {
    return <ShopPricingPage />;
  }

  return <NonCollegeShopPricingPage shopSlug={slug} />;
}
