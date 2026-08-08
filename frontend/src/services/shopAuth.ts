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
export async function loginShop(pin: string): Promise<ShopAuthResponse> {
  const validation = validatePinFormat(pin);
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.error || "Invalid PIN format.",
    };
  }

  // Simulate slight authentication network delay for smooth UI transition
  await new Promise((resolve) => setTimeout(resolve, 550));

  if (pin === SHOP_ACCESS_PIN) {
    return {
      success: true,
      message: "Access Granted",
    };
  }

  return {
    success: false,
    message: "Incorrect PIN. Please try again.",
  };
}
