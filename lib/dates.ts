const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/**
 * Format a YYYY-MM date string into a human-readable label.
 * Only YYYY is accepted too (for year-only dates).
 */
export function formatDate(date: string): string {
  const parts = date.split("-");
  const year = parts[0];
  const month = parts[1] ? parseInt(parts[1], 10) - 1 : null;
  if (month === null) return year;
  return `${MONTHS[month]} ${year}`;
}

/**
 * Format a start + end date pair into a range string.
 * Always uses absolute dates -- never relative ("6 months ago").
 *
 * Examples:
 *   formatDateRange("2025-05", "2025-08")  => "may 2025 - aug 2025"
 *   formatDateRange("2024-08", null)        => "aug 2024 - present"
 *   formatDateRange("2023-08", "2024-05")  => "aug 2023 - may 2024"
 */
export function formatDateRange(
  startDate: string,
  endDate: string | null
): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "present";
  return `${start} - ${end}`;
}

/**
 * How many days ago was an ISO date string?
 * Used for the /now staleness check.
 */
export function daysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}
