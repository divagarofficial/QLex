import type { Metadata } from "next";
import ShopOrderDetailsPage from "@/components/shop/orders/ShopOrderDetailsPage";

export const metadata: Metadata = {
  title: "Order Details & Print Processing — QLex Shop",
  description: "Granular document preview, custom page range selection, and printer workstation control.",
};

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ orderId: "placeholder" }];
}

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  return <ShopOrderDetailsPage orderId={orderId} />;
}
