/**
 * PIN Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a string is a valid 4-digit PIN.
 */
export function validatePinFormat(pin: string): ValidationResult {
  if (!pin) {
    return { isValid: false, error: "PIN is required" };
  }
  if (pin.length !== 4) {
    return { isValid: false, error: "PIN must be exactly 4 digits" };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { isValid: false, error: "PIN must contain only numbers" };
  }
  return { isValid: true };
}
