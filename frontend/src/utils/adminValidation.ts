/**
 * Admin Password Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that an admin password input is present and non-empty.
 */
export function validateAdminPasswordFormat(password: string): ValidationResult {
  if (!password || password.trim().length === 0) {
    return { isValid: false, error: "Password is required" };
  }
  return { isValid: true };
}
