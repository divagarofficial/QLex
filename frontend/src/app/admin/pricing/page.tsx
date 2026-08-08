import { Metadata } from "next";
import AdminPricingPage from "@/components/admin/pricing/AdminPricingPage";

export const metadata: Metadata = {
  title: "Pricing Management | QLex Executive Control Center",
  description: "Global pricing engine, platform fee configuration, print rates, priority pass charges, and live pricing calculator for QLex.",
};

export default function Page() {
  return <AdminPricingPage />;
}
