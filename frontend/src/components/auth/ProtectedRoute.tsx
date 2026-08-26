"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser } from "@/services/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
  requiredRole?: "student" | "staff" | "admin";
}

export default function ProtectedRoute({ children, redirectPath, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const hydrate = useAuthStore((s) => s.hydrate);
  const validatedRef = useRef(false);

  const isStaffRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/staff");
  const targetRequiredRole = requiredRole || (isStaffRoute ? "staff" : "student");
  const fallbackRedirect = redirectPath || (targetRequiredRole === "staff" ? "/staff/login" : "/student/login");

  useEffect(() => {
    // Hydrate token from localStorage on mount
    const storedToken = hydrate();

    if (!storedToken) {
      router.replace(fallbackRedirect);
      return;
    }

    // Only validate /me once per mount
    if (validatedRef.current) return;
    validatedRef.current = true;

    // Silently validate token in background
    getCurrentUser(storedToken)
      .then((u) => {
        setUser(u);
        if (targetRequiredRole && u?.role && u.role.toLowerCase() !== targetRequiredRole.toLowerCase()) {
          if (u.role.toLowerCase() === "student") {
            router.replace("/student/dashboard");
          } else if (u.role.toLowerCase() === "staff") {
            router.replace("/staff/dashboard");
          } else {
            router.replace(fallbackRedirect);
          }
        }
      })
      .catch((err: any) => {
        if (err?.response?.status === 401 || err?.status === 401) {
          logout();
          router.replace(fallbackRedirect);
        }
      });
  }, [fallbackRedirect, hydrate, logout, router, setUser, targetRequiredRole]);

  // Not authenticated
  if (!token || !isAuthenticated) {
    return null;
  }

  // Strict Role Mismatch Check: Block rendering if user is student on staff page or staff on student page
  if (user?.role && targetRequiredRole && user.role.toLowerCase() !== targetRequiredRole.toLowerCase()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <div className="max-w-md p-6 rounded-3xl border border-red-500/30 bg-red-950/20 space-y-4">
          <h2 className="text-xl font-bold text-red-400">Access Denied</h2>
          <p className="text-sm text-white/80">
            This portal is strictly for <strong className="uppercase">{targetRequiredRole}</strong> accounts.
            You are currently signed in as a <strong className="uppercase text-amber-300">{user.role}</strong> ({user.full_name}).
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                logout();
                router.replace(targetRequiredRole === "staff" ? "/staff/login" : "/student/login");
              }}
              className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition cursor-pointer"
            >
              Sign Out & Switch Portal
            </button>
            <button
              onClick={() => {
                const userRole = user?.role?.toLowerCase();
                router.replace(userRole === "student" ? "/student/dashboard" : userRole === "staff" ? "/staff/dashboard" : "/");
              }}
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition cursor-pointer"
            >
              Go to My Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
