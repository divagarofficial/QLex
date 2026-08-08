import type { Metadata } from "next";
import ShopOrdersPage from "@/components/shop/orders/ShopOrdersPage";

export const metadata: Metadata = {
  title: "Shop Orders — QLex Print Operations",
  description: "Operational workbench for processing campus print orders.",
};

export default function Page() {
  return <ShopOrdersPage />;
}
