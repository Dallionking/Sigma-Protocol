import { z } from "zod";

/**
 * Email validation schema
 * Relaxed: accepts any non-empty string for flow testing
 */
export const emailSchema = z.object({
  email: z.string().min(1, "Required"),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

/**
 * Password validation
 * Relaxed: accepts any non-empty string for flow testing
 */
export const passwordSchema = z.object({
  password: z.string().min(1, "Required"),
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;

/**
 * Sign in credentials schema
 * Relaxed: accepts any non-empty strings for flow testing
 */
export const signinSchema = z.object({
  email: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

export type SigninFormValues = z.infer<typeof signinSchema>;

/**
 * OTP verification schema
 * Relaxed: accepts any non-empty string for flow testing
 */
export const otpSchema = z.object({
  code: z.string().min(1, "Required"),
});

export type OTPFormValues = z.infer<typeof otpSchema>;

/**
 * Display name schema
 * Relaxed: accepts any non-empty string for flow testing
 */
export const nameSchema = z.object({
  name: z.string().min(1, "Required"),
});

export type NameFormValues = z.infer<typeof nameSchema>;

/**
 * Password strength calculator
 * Returns 0-4 score (kept for visual display)
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}

/**
 * Password strength requirements check (kept for visual display)
 */
export function getPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasNumber: /[0-9]/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
    hasUpperLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };
}



