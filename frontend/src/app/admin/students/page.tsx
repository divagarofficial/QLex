import { Metadata } from "next";
import StudentsPage from "@/components/admin/students/StudentsPage";

export const metadata: Metadata = {
  title: "Students Management | QLex Admin",
  description: "Executive control and management page for QLex registered students.",
};

export default function Page() {
  return <StudentsPage />;
}
