import { Metadata } from "next";
import AdminSettlementsPage from "@/components/admin/settlements/AdminSettlementsPage";

export const metadata: Metadata = {
  title: "Merchant Settlements | QLex Executive Financial Control",
  description: "Financial settlement monitoring, payout tracking, merchant earnings, and automated statement generation for QLex.",
};

export default function Page() {
  return <AdminSettlementsPage />;
}
