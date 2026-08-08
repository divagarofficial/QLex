import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | QLex Executive Control Center",
  description: "Real-time administrative control panel, live queue tracking, shop metrics, and platform financial health for QLex.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
