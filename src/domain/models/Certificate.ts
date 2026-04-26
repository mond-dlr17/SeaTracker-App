export type CertificateStatus = 'valid' | 'warning' | 'expired';

/** Single uploaded file on a certificate (multiple allowed). */
export type CertificateAttachment = {
  id: string;
  url: string;
  storagePath: string;
  filename: string;
  contentType?: string;
  sizeBytes?: number;
};

export type Certificate = {
  id: string;
  name: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  /** New multi-attachment model */
  attachments?: CertificateAttachment[];
  /** Legacy single file (still read for existing data; UI merges with `attachments`) */
  fileUrl?: string;
  filePath?: string;
  createdAt: number;
  updatedAt: number;
};

