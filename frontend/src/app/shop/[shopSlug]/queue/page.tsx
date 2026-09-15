import type { Metadata } from "next";
import NonCollegeShopQueuePage from "@/components/shop/NonCollegeShopQueuePage";
import SatelliteShopQueuePage from "@/components/shop/satellite/SatelliteShopQueuePage";

export const metadata: Metadata = {
  title: "Shop Live Print Queue — QLex Platform",
  description: "Live print queue for shop.",
};

interface PageProps {
  params: Promise<{ shopSlug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.shopSlug?.toLowerCase() || "rit";

  if (slug === "satellite") {
    return <SatelliteShopQueuePage />;
  }

  return <NonCollegeShopQueuePage shopSlug={slug} />;
}
