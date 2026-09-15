import type { Metadata } from "next";
import NonCollegeShopSettlementsPage from "@/components/shop/NonCollegeShopSettlementsPage";
import SatelliteShopSettlementsPage from "@/components/shop/satellite/SatelliteShopSettlementsPage";

export const metadata: Metadata = {
  title: "Shop Settlements & Revenue — QLex Platform",
  description: "Manage revenue settlements and payouts for shop.",
};

interface PageProps {
  params: Promise<{ shopSlug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.shopSlug?.toLowerCase() || "rit";

  if (slug === "satellite") {
    return <SatelliteShopSettlementsPage />;
  }

  return <NonCollegeShopSettlementsPage shopSlug={slug} />;
}
