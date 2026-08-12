import { ADMIN_ACCESS_PASSWORD } from "@/config/admin";
import { validateAdminPasswordFormat } from "@/utils/adminValidation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://qlex-two.vercel.app";
export const ADMIN_TOKEN_KEY = "qlex_admin_token";

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  token?: string;
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
}

export function logoutAdmin(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

/**
 * Modular Admin Authentication Service
 * Calls FastAPI `/api/v1/auth/admin-login` backend endpoint and stores session token.
 */
export async function loginAdmin(password: string): Promise<AdminAuthResponse> {
  const validation = validateAdminPasswordFormat(password);
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.error || "Password is required.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const data = await res.json();
      const token = data.token || "admin-executive-session-token";
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
      }
      return {
        success: true,
        message: data.message || "Access Granted",
        token,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.detail || "Incorrect password. Access Denied.",
      };
    }
  } catch (err) {
    // Fallback to local config check if offline
    if (password === ADMIN_ACCESS_PASSWORD) {
      const token = "admin-executive-session-token";
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
      }
      return {
        success: true,
        message: "Access Granted (Local Verification)",
        token,
      };
    }
    return {
      success: false,
      message: "Authentication failed. Server unreachable.",
    };
  }
}

