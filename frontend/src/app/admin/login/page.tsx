import type { Metadata } from "next";
import AdminLoginPage from "@/components/admin/AdminLoginPage";

export const metadata: Metadata = {
  title: "Admin Login | QLex Admin Portal",
  description: "Restricted access portal for authorized QLex administrators.",
};

export default function AdminLoginRoute() {
  return <AdminLoginPage />;
}
