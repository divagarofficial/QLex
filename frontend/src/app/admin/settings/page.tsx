import { Metadata } from "next";
import PlatformSettingsPage from "@/components/admin/settings/PlatformSettingsPage";

export const metadata: Metadata = {
  title: "Platform Settings | QLex Admin Executive Control Center",
  description:
    "Centralized platform settings, module toggles, order limits, security policies, and integration configuration for QLex.",
};

export default function Page() {
  return <PlatformSettingsPage />;
}
