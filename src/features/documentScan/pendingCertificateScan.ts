export type PendingCertificateScan = {
  localUri: string;
  filename: string;
  contentType?: string;
  name?: string;
  issueDate?: string;
  expiryDate?: string;
};

let pending: PendingCertificateScan | null = null;

export function setPendingCertificateScan(value: PendingCertificateScan) {
  pending = value;
}

export function consumePendingCertificateScan(): PendingCertificateScan | null {
  const next = pending;
  pending = null;
  return next;
}
