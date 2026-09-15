import type { Metadata } from "next";
import NonCollegeShopDashboard from "@/components/shop/NonCollegeShopDashboard";
import ShopDashboard from "@/components/shop/ShopDashboard";

export const metadata: Metadata = {
  title: "Shop Operator Dashboard — QLex Platform",
  description: "Live Print Queue & Operator Workbench.",
};

interface PageProps {
  params: Promise<{ shopSlug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.shopSlug?.toLowerCase() || "rit";

  if (slug === "satellite") {
    return <ShopDashboard defaultHub="QLex Satellite Print Hub" />;
  }
  if (slug === "rit" || slug === "central") {
    return <ShopDashboard defaultHub="QLex Central Print Hub" />;
  }

  // Dynamic non-college registered shop dashboard (e.g. ACME OFFSET AND PRINTERS)
  return <NonCollegeShopDashboard shopSlug={slug} />;
}


