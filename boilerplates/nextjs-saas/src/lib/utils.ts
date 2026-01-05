import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 * 
 * @stable since 1.0.0
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * 
 * @stable since 1.0.0
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format a date in a human-readable way
 * 
 * @stable since 1.0.0
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(
    typeof date === "string" ? new Date(date) : date
  );
}

/**
 * Sleep for a specified number of milliseconds
 * 
 * @stable since 1.0.0
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 * 
 * @stable since 1.0.0
 */
export function generateId(length: number = 16): string {
  return Array.from({ length }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");
}

/**
 * Truncate a string to a maximum length
 * 
 * @stable since 1.0.0
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Debounce a function
 * 
 * @stable since 1.0.0
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Check if running on server
 * 
 * @stable since 1.0.0
 */
export const isServer = typeof window === "undefined";

/**
 * Check if running on client
 * 
 * @stable since 1.0.0
 */
export const isClient = !isServer;

/**
 * Get the base URL for the app
 * 
 * @stable since 1.0.0
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

