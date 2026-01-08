/**
 * Date utilities for consistent timezone handling across the application
 *
 * The application uses America/Sao_Paulo timezone (Brazil) for all date displays.
 * Dates are stored in UTC in the database and converted to local timezone when displayed.
 */

// Application timezone - Brazil (Sao Paulo)
export const APP_TIMEZONE = "America/Sao_Paulo";
export const APP_LOCALE = "pt-BR";

/**
 * Formats a date to a locale date string using the application timezone
 * This prevents the "one day less" issue when dates are stored in UTC
 *
 * @param date - Date object, string, or null/undefined
 * @param locale - Locale string (defaults to "pt-BR")
 * @returns Formatted date string (e.g., "15/01/2024")
 */
export function formatLocalDate(
  date: Date | string | null | undefined,
  locale: string = APP_LOCALE
): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  // Use local date components to avoid timezone conversion issues
  // This ensures we display the date as it appears in the user's timezone
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  if (locale === "pt-BR" || locale === "pt-br") {
    return `${day}/${month}/${year}`;
  }

  // Fallback to standard locale formatting
  return dateObj.toLocaleDateString(locale);
}

/**
 * Formats a date to YYYY-MM-DD format for HTML date inputs using local timezone
 *
 * @param date - Date object, string, or null/undefined
 * @returns Date string in YYYY-MM-DD format (e.g., "2024-01-15")
 */
export function formatDateForInput(
  date: Date | string | null | undefined
): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  // Use local date components to avoid timezone conversion issues
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Creates a Date object from a date string (YYYY-MM-DD) in local timezone
 * This ensures the date is interpreted correctly without timezone shifts
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseDateFromInput(dateString: string): Date {
  if (!dateString) {
    return new Date();
  }

  // Parse YYYY-MM-DD format and create date in local timezone
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a date with time using the application locale
 *
 * @param date - Date object, string, or null/undefined
 * @param locale - Locale string (defaults to "pt-BR")
 * @returns Formatted date and time string
 */
export function formatLocalDateTime(
  date: Date | string | null | undefined,
  locale: string = APP_LOCALE
): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleString(locale, {
    timeZone: APP_TIMEZONE,
  });
}

/**
 * Formats a date as a relative time string (e.g., "há 2 horas", "há 3 dias")
 *
 * @param date - Date object or string
 * @param locale - Locale string (defaults to "pt-BR")
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = APP_LOCALE
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return locale === "pt-BR" ? "agora" : "now";
  }

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  const ptBRLabels = {
    year: { singular: "ano", plural: "anos" },
    month: { singular: "mês", plural: "meses" },
    week: { singular: "semana", plural: "semanas" },
    day: { singular: "dia", plural: "dias" },
    hour: { singular: "hora", plural: "horas" },
    minute: { singular: "minuto", plural: "minutos" },
  };

  const enLabels = {
    year: { singular: "year", plural: "years" },
    month: { singular: "month", plural: "months" },
    week: { singular: "week", plural: "weeks" },
    day: { singular: "day", plural: "days" },
    hour: { singular: "hour", plural: "hours" },
    minute: { singular: "minute", plural: "minutes" },
  };

  const labels = locale === "pt-BR" ? ptBRLabels : enLabels;
  const prefix = locale === "pt-BR" ? "há" : "";
  const suffix = locale === "pt-BR" ? "" : "ago";

  for (const [key, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      const label = labels[key as keyof typeof labels];
      const timeUnit = interval === 1 ? label.singular : label.plural;
      if (locale === "pt-BR") {
        return `${prefix} ${interval} ${timeUnit}`;
      } else {
        return `${interval} ${timeUnit} ${suffix}`;
      }
    }
  }

  return locale === "pt-BR" ? "agora" : "now";
}

