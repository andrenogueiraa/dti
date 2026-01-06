/**
 * Calendar configuration constants
 * Centralized configuration for calendar dimensions and spacing
 */

export const CALENDAR_CONSTANTS = {
  // Pixels per day - determines the horizontal scale of the calendar
  // Target: ~15 days should be at least 200px wide for readability
  PIXELS_PER_DAY: 15, // 15 days = 225px, which is readable

  // Project card dimensions
  TITLE_HEIGHT: 20, // Height reserved for project title inside card

  // Sprint dimensions
  SPRINT_HEIGHT: 32, // Default height of sprint bars
  SPRINT_MIN_HEIGHT: 20, // Minimum height when space is constrained
  SPRINT_SPACING: 4, // Vertical spacing between sprint rows
} as const;
