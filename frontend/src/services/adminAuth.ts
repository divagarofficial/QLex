import { ADMIN_ACCESS_PASSWORD } from "@/config/admin";
import { validateAdminPasswordFormat } from "@/utils/adminValidation";

export interface AdminAuthResponse {
  success: boolean;
  message: string;
}

/**
 * Modular Admin Authentication Service
 * Currently verifies password against temporary config.
 * Keep async interface for seamless backend integration later.
 */
export async function loginAdmin(password: string): Promise<AdminAuthResponse> {
  const validation = validateAdminPasswordFormat(password);
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.error || "Password is required.",
    };
  }

  // Simulate slight authentication network delay for smooth UI feedback
  await new Promise((resolve) => setTimeout(resolve, 550));

  if (password === ADMIN_ACCESS_PASSWORD) {
    return {
      success: true,
      message: "Access Granted",
    };
  }

  return {
    success: false,
    message: "Incorrect password. Please try again.",
  };
}
