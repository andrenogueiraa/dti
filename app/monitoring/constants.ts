/**
 * Calendar configuration constants for monitoring view
 * Centralized configuration for calendar dimensions and spacing
 */

export const MONITORING_CALENDAR_CONSTANTS = {
  // Pixels per day - determines the horizontal scale of the calendar
  // Larger than past-projects for better visibility of dates
  PIXELS_PER_DAY: 30, // 30 days = 900px, which is readable

  // Row dimensions
  ROW_HEIGHT: 80, // Height of each team row

  // Marker dimensions
  MARKER_SIZE: 16, // Size of doc review and sprint markers

  // Safe zone (15 days)
  SAFE_ZONE_DAYS: 15, // Number of days that should be safe
} as const;

