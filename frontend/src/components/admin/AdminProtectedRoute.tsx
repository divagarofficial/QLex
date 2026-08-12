"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/services/adminAuth";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const isAuth = isAdminAuthenticated();
    if (!isAuth) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
