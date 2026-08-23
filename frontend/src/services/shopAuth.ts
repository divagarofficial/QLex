import { SHOP_ACCESS_PIN } from "@/config/shop";
import { validatePinFormat } from "@/utils/shopValidation";

export interface ShopAuthResponse {
  success: boolean;
  message: string;
}

/**
 * Modular Shop Authentication Service
 * Currently verifies PIN against temporary config (0810).
 * Keep async interface for seamless backend integration later.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://qlex-backend-ybnb435gbq-el.a.run.app";

export async function loginShop(pin: string): Promise<ShopAuthResponse> {
  const validation = validatePinFormat(pin);
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.error || "Invalid PIN format.",
    };
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/shop-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: "Incorrect PIN." }));
      return {
        success: false,
        message: errData.detail || "Incorrect PIN. Please try again.",
      };
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("qlex_shop_token", data.token);
    }
    return {
      success: true,
      message: data.message || "Access Granted",
    };
  } catch {
    // Fallback to local check if network error occurs
    if (pin === SHOP_ACCESS_PIN) {
      return {
        success: true,
        message: "Access Granted (Offline Mode)",
      };
    }
    return {
      success: false,
      message: "Incorrect PIN. Please try again.",
    };
  }
}
