import dayjs from 'dayjs';
import type { CertificateStatus } from '../../domain/models/Certificate';

export function getCertificateStatus(expiryDate: string, now = new Date()): CertificateStatus {
  const daysLeft = dayjs(expiryDate).startOf('day').diff(dayjs(now).startOf('day'), 'day');
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring';
  return 'valid';
}

