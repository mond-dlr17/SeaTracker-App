import dayjs from 'dayjs';

/** Display format e.g. `Jan 20, 2026`. */
const DISPLAY = 'MMM D, YYYY';

/**
 * Formats an ISO date string (`YYYY-MM-DD`), timestamp (ms), or `Date` for UI.
 * Empty or invalid values return an em dash.
 */
export function formatDate(value: string | Date | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' && value.trim() === '') return '—';
  const d = dayjs(value);
  if (!d.isValid()) return '—';
  return d.format(DISPLAY);
}
