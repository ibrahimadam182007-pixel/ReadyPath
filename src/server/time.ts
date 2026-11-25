/**
 * Time helpers. All user-facing dates in ReadyPath are calendar dates in Indonesia (WIB, UTC+7).
 *
 * Convention: a deadline "15 Jan 2027" is stored as 2027-01-15 23:59:59 WIB (= 16:59:59Z).
 * The engine compares UTC calendar days, so passing it `toWib(now)` as the reference date makes
 * "days left" agree with the WIB calendar date.
 */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Shift an instant so its UTC fields read as Asia/Jakarta wall-clock time. */
export function toWib(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET_MS);
}

function wibDayStartMs(date: Date): number {
  const w = toWib(date);
  return Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate());
}

/** Whole WIB calendar days from `from` to `to` (positive when `to` is later). */
export function wibDayDiff(to: Date, from: Date): number {
  return Math.round((wibDayStartMs(to) - wibDayStartMs(from)) / MS_PER_DAY);
}

/** "YYYY-MM-DD" of the WIB calendar date of an instant. */
export function wibDateString(date: Date): string {
  return toWib(date).toISOString().slice(0, 10);
}

/** 23:59:59 WIB on the given "YYYY-MM-DD" date. */
export function endOfDayWib(ymd: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) throw new Error(`Invalid date: ${ymd}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 16, 59, 59));
}
