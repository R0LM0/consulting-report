// Shared month/date helpers for the activity log and report generation.
// Spanish month names, 0-indexed to match Date/array conventions elsewhere
// (index 0 = Enero, matching JS's 0-based getMonth()).
export const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

/** Inclusive/exclusive [start, end) UTC bounds for a given calendar month. */
export function getMonthBounds(year: number, month1to12: number) {
  const start = new Date(Date.UTC(year, month1to12 - 1, 1));
  const end = new Date(Date.UTC(year, month1to12, 1));
  return { start, end };
}

/** Last calendar day of the given month, as a UTC midnight Date. */
export function getLastDayOfMonth(year: number, month1to12: number): Date {
  return new Date(Date.UTC(year, month1to12, 0));
}

/**
 * Parses a `<input type="date">` value ("YYYY-MM-DD") into a UTC-midnight
 * Date. Used for values stored via Prisma's `@db.Date`, so the calendar day
 * round-trips correctly regardless of the server's local timezone.
 */
export function parseDateInputUTC(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/**
 * Parses a `<input type="date">` value into a *local*-midnight Date. Needed
 * for values fed to generate-recibo.ts, which reads the day/month/year back
 * out with local Date getters (getDate/getFullYear) - constructing via UTC
 * here would shift the displayed day by one in timezones ahead of UTC.
 */
export function parseDateInputLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Formats a Date (assumed UTC-midnight, e.g. from Activity.date) back into
 * the "YYYY-MM-DD" shape `<input type="date">` expects. */
export function formatDateInputValue(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Formats a Date (assumed UTC-midnight) as "dd/mm/yyyy" for display. */
export function formatDateDisplay(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/** Parses a query-string integer, falling back when missing/invalid. */
export function parseIntOrDefault(
  value: string | undefined,
  fallback: number
): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

/** Parses a year query param, clamped to a sane range (2000-2100). */
export function parseYearParam(
  value: string | undefined,
  fallback: number
): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100
    ? parsed
    : fallback;
}

/** Parses a single-month query param (1-12), falling back when invalid. */
export function parseMonthParam(
  value: string | undefined,
  fallback: number
): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12
    ? parsed
    : fallback;
}

/**
 * Parses a multi-month query param ("3,5,7") into a sorted, de-duplicated
 * list of valid months. Falls back to [fallback] when empty/invalid.
 */
export function parseMonthsParam(
  value: string | undefined,
  fallback: number
): number[] {
  if (!value) return [fallback];
  const months = [
    ...new Set(
      value
        .split(",")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12)
    ),
  ].sort((a, b) => a - b);
  return months.length > 0 ? months : [fallback];
}
