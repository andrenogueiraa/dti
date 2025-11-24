import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export date utilities for convenience
export {
  formatLocalDate,
  formatDateForInput,
  parseDateFromInput,
  formatLocalDateTime,
  APP_TIMEZONE,
  APP_LOCALE,
} from "./date-utils"
