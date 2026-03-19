export type CertificateStatus = 'valid' | 'expiring' | 'expired';

export type Certificate = {
  id: string;
  name: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  fileUrl?: string;
  filePath?: string;
  createdAt: number;
  updatedAt: number;
};

