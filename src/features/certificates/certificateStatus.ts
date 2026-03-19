import dayjs from 'dayjs';
import type { CertificateStatus } from '../../domain/models/Certificate';

export function getCertificateStatus(expiryDate: string, _issueDate?: string): CertificateStatus {
  // Status is based on time left until expiry (relative to today).
  // Keep `_issueDate` optional so existing callers that pass only `expiryDate` keep working.
  const expiry = dayjs(expiryDate);
  if (!expiry.isValid()) return 'warning';

  const daysLeft = expiry.startOf('day').diff(dayjs().startOf('day'), 'day');

  if (daysLeft <= 0) return 'expired';
  // "warning" includes expiring today and expiring within the next 30 days.
  if (daysLeft <= 30) return 'warning';
  return 'valid';
}

