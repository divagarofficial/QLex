"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ShopQueuePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /shop/queue to /shop/orders where live queue operations are handled
    router.replace("/shop/orders");
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsidian text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-sm font-medium text-white/60">Redirecting to Live Shop Queue...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
