import dayjs from 'dayjs';
import type { CertificateStatus } from '../../domain/models/Certificate';

export function getCertificateStatus(expiryDate: string, now = new Date()): CertificateStatus {
  const daysLeft = dayjs(expiryDate).startOf('day').diff(dayjs(now).startOf('day'), 'day');
  if (daysLeft < 0) return 'expired';
  // "warning" includes both expiring today and expiring soon.
  if (daysLeft <= 30) return 'warning';
  return 'valid';
}

