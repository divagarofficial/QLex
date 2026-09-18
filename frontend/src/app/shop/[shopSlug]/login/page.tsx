import type { Metadata } from "next";
import NonCollegeShopLoginPage from "@/components/shop/NonCollegeShopLoginPage";

export const metadata: Metadata = {
  title: "Shop Operator Login — QLex Platform",
  description: "Secure 4-Digit PIN Access for Print Shop Operators.",
};

interface PageProps {
  params: Promise<{ shopSlug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.shopSlug?.toLowerCase() || "acme";

  return <NonCollegeShopLoginPage shopSlug={slug} />;
}
