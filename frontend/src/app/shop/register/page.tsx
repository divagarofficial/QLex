import type { Metadata } from "next";
import ShopRegisterPage from "@/components/shop/ShopRegisterPage";

export const metadata: Metadata = {
  title: "Register Non-College Shop — QLex",
  description: "Register a non-college express print shop and set a 4-digit operator PIN.",
};

export default function Page() {
  return <ShopRegisterPage />;
}
