import type { Metadata } from "next";
import NonCollegeShopOrdersPage from "@/components/shop/NonCollegeShopOrdersPage";
import ShopOrdersPage from "@/components/shop/orders/ShopOrdersPage";

export const metadata: Metadata = {
  title: "Shop Orders Workbench — QLex Platform",
  description: "Manage orders for shop.",
};

interface PageProps {
  params: Promise<{ shopSlug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.shopSlug?.toLowerCase() || "rit";

  if (slug === "rit" || slug === "central" || slug === "satellite") {
    return <ShopOrdersPage />;
  }

  return <NonCollegeShopOrdersPage shopSlug={slug} />;
}
