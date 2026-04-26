import * as FileSystem from 'expo-file-system/legacy';

import type { Certificate, CertificateAttachment } from '../../domain/models/Certificate';

/** Synthetic id for pre–multi-attachment certificates stored as `fileUrl` / `filePath` only. */
export const LEGACY_CERTIFICATE_ATTACHMENT_ID = '__legacy__';

export const CERTIFICATE_ATTACHMENT_MAX_BYTES = 3 * 1024 * 1024;

/** MIME types and extensions we accept for certificate attachments. */
export const CERTIFICATE_ATTACHMENT_PICKER_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/heic',
  'image/heif',
] as const;

const ALLOWED_MIME = new Set<string>([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/heic',
  'image/heif',
]);

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  heic: 'image/heic',
  heif: 'image/heif',
};

export type CertificateAttachmentKind = 'image' | 'pdf' | 'unknown';

export function attachmentKindFromMime(mime: string | undefined, filename: string): CertificateAttachmentKind {
  const m = (mime ?? '').toLowerCase();
  if (m === 'application/pdf' || m.includes('pdf')) return 'pdf';
  if (m.startsWith('image/')) return 'image';
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'heic', 'heif', 'webp', 'gif'].includes(ext)) return 'image';
  return 'unknown';
}

export function normalizeAttachmentContentType(mime: string | undefined, filename: string): string | undefined {
  const trimmed = mime?.trim();
  if (trimmed && ALLOWED_MIME.has(trimmed.toLowerCase())) {
    return trimmed.toLowerCase() === 'image/jpg' ? 'image/jpeg' : trimmed.toLowerCase();
  }
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_MIME[ext];
}

export function isAllowedCertificateAttachment(mime: string | undefined, filename: string): boolean {
  const normalized = normalizeAttachmentContentType(mime, filename);
  return !!normalized && ALLOWED_MIME.has(normalized);
}

export function validateCertificateAttachmentSize(sizeBytes: number | undefined): string | null {
  if (sizeBytes == null) return null;
  if (sizeBytes > CERTIFICATE_ATTACHMENT_MAX_BYTES) {
    return `Each file must be ${CERTIFICATE_ATTACHMENT_MAX_BYTES / (1024 * 1024)}MB or smaller.`;
  }
  return null;
}

export async function resolveLocalFileSizeBytes(
  uri: string,
  pickerReportedSize?: number,
): Promise<number | undefined> {
  if (typeof pickerReportedSize === 'number') return pickerReportedSize;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && 'size' in info && typeof info.size === 'number') return info.size;
  } catch {
    /* ignore */
  }
  return undefined;
}

function guessLegacyContentType(filePathOrUrl: string): string | undefined {
  const lower = filePathOrUrl.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return undefined;
}

export function parseStoredAttachments(raw: unknown): CertificateAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: CertificateAttachment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : '';
    const url = typeof o.url === 'string' ? o.url : '';
    const storagePath = typeof o.storagePath === 'string' ? o.storagePath : '';
    const filename = typeof o.filename === 'string' ? o.filename : 'attachment';
    if (!id || !url || !storagePath) continue;
    out.push({
      id,
      url,
      storagePath,
      filename,
      contentType: typeof o.contentType === 'string' ? o.contentType : undefined,
      sizeBytes: typeof o.sizeBytes === 'number' ? o.sizeBytes : undefined,
    });
  }
  return out;
}

/** All attachments for UI and storage cleanup: legacy single file first (if any), then `attachments`. */
export function listCertificateAttachments(cert: Certificate): CertificateAttachment[] {
  const fromFirestore = cert.attachments ?? [];
  if (cert.fileUrl && cert.filePath) {
    const legacy: CertificateAttachment = {
      id: LEGACY_CERTIFICATE_ATTACHMENT_ID,
      url: cert.fileUrl,
      storagePath: cert.filePath,
      filename: 'Attachment',
      contentType: guessLegacyContentType(cert.filePath) ?? guessLegacyContentType(cert.fileUrl),
    };
    return [legacy, ...fromFirestore];
  }
  return fromFirestore;
}

export function firstImageAttachmentUrl(cert: Certificate): string | undefined {
  for (const a of listCertificateAttachments(cert)) {
    if (attachmentKindFromMime(a.contentType, a.filename) === 'image') return a.url;
  }
  return undefined;
}
