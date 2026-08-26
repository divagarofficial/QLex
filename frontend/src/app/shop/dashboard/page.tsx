import type { Metadata } from "next";
import ShopDashboard from "@/components/shop/ShopDashboard";

export const metadata: Metadata = {
  title: "QLex Central Print Hub",
  description: "QLex Central Print Hub — RIT Campus Road, Opposite to A Block, RIT Main Campus.",
};

export default function Page() {
  return <ShopDashboard />;
}
