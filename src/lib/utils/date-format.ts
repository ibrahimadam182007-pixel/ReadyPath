const MS_PER_DAY = 24 * 60 * 60 * 1000;

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const SHORT_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

function toUtcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Formats date as "Fri, 15 Jan 2027" per docs/design.md Section 7.
 */
export function formatLongDate(date: Date): string {
  const dayName = SHORT_DAYS[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = SHORT_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Formats date as "15 Jan 2027".
 */
export function formatMediumDate(date: Date): string {
  const day = date.getUTCDate();
  const month = SHORT_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Formats compact date as "15 Jan" per docs/design.md Section 7.
 */
export function formatCompactDate(date: Date): string {
  const day = date.getUTCDate();
  const month = SHORT_MONTHS[date.getUTCMonth()];
  return `${day} ${month}`;
}

/**
 * Formats "Nov 2026" for last-verified pill.
 */
export function formatMonthYear(date: Date): string {
  return `${SHORT_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Returns integer days between referenceDate and deadline.
 */
export function getDaysLeft(deadline: Date, referenceDate: Date = new Date()): number {
  return Math.ceil((toUtcDayMs(deadline) - toUtcDayMs(referenceDate)) / MS_PER_DAY);
}

/**
 * Formats relative days ("in 14 days", "today", "3 days ago").
 */
export function formatRelativeDays(targetDate: Date, referenceDate: Date = new Date()): string {
  const diff = getDaysLeft(targetDate, referenceDate);
  if (diff === 0) return "today";
  if (diff === 1) return "in 1 day";
  if (diff > 1) return `in ${diff} days`;
  if (diff === -1) return "1 day ago";
  return `${Math.abs(diff)} days ago`;
}
