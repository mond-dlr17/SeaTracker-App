import dayjs from 'dayjs';

export function isValidISODate(d: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  return dayjs(d).isValid();
}

