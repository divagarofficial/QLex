"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser } from "@/services/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function ProtectedRoute({ children, redirectPath }: ProtectedRouteProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const hydrate = useAuthStore((s) => s.hydrate);
  const validatedRef = useRef(false);

  const fallbackRedirect = redirectPath || (typeof window !== "undefined" && window.location.pathname.startsWith("/staff") ? "/staff/login" : "/student/login");

  useEffect(() => {
    // Hydrate token from localStorage on mount
    const storedToken = hydrate();

    if (!storedToken) {
      router.replace(fallbackRedirect);
      return;
    }

    // Only validate /me once per mount (not on every re-render)
    if (validatedRef.current) return;
    validatedRef.current = true;

    // Silently validate token in background
    getCurrentUser(storedToken)
      .then((user) => setUser(user))
      .catch((err: any) => {
        // Only logout if backend explicitly responds with 401 (token expired/invalid)
        if (err?.response?.status === 401 || err?.status === 401) {
          logout();
          router.replace(fallbackRedirect);
        }
      });
  }, []); // intentionally only run once on mount

  // Not authenticated — don't render children, will redirect
  if (!token || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

