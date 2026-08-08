import type { Metadata } from "next";
import ShopLoginPage from "@/components/shop/ShopLoginPage";

export const metadata: Metadata = {
  title: "Shop Portal Login — QLex",
  description: "Secure PIN access for QLex Print Shop Operators.",
};

export default function Page() {
  return <ShopLoginPage />;
}
