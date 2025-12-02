import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// 1. Export the `cn` function (already included)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 2. Export `formatCurrency`
export function formatCurrency(amount: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// 3. Export `formatDateShort`
export function formatDateShort(dateString: string | Date): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short', // e.g., 'Nov'
    day: 'numeric', // e.g., '29'
    year: 'numeric', // e.g., '2025'
  })
}

// 4. Export `formatDate` (if you need a different format, adjust accordingly)
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',  // e.g., 'November'
    day: 'numeric', // e.g., '29'
  })
}