import dayjs from 'dayjs';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import type { Certificate, CertificateAttachment } from '../../domain/models/Certificate';
import {
  LEGACY_CERTIFICATE_ATTACHMENT_ID,
  listCertificateAttachments,
  parseStoredAttachments,
} from './certificateAttachments';
import { firestore, storage } from '../../shared/services/firebase';

function certsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'certificates');
}

function normalizeToNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as any).toDate === 'function') {
    return (value as any).toDate().valueOf();
  }
  return 0;
}

function normalizeToISODate(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as any).toDate === 'function') {
    const d = (value as any).toDate();
    return dayjs(d).format('YYYY-MM-DD');
  }
  if (value instanceof Date) return dayjs(value).format('YYYY-MM-DD');
  if (typeof value === 'number') return dayjs(value).format('YYYY-MM-DD');
  return '';
}

const SAMPLE_CERT_IMAGE_FILENAME = 'sample-certificate.png';
// 1x1 transparent PNG (base64). Kept intentionally small for quick seeding.
const SAMPLE_CERT_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5+6ZkAAAAASUVORK5CYII=';

async function getOrCreateSampleCertificateImage(): Promise<{
  localUri: string;
  filename: string;
  contentType: string;
}> {
  const filename = SAMPLE_CERT_IMAGE_FILENAME;
  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
  const localUri = `${baseDir}${filename}`;

  const info = await FileSystem.getInfoAsync(localUri);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(localUri, SAMPLE_CERT_IMAGE_BASE64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  return { localUri, filename, contentType: 'image/png' };
}

async function uriToBlob(uri: string): Promise<Blob> {
  // RN / Expo can behave differently for `file://` vs `content://` URIs.
  // Try `fetch` first; if it fails, fall back to `XMLHttpRequest`.
  try {
    const res = await fetch(uri);
    return await res.blob();
  } catch {
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onerror = () => reject(new Error('Failed to download image for upload.'));
      xhr.onload = () => {
        // Some RN transports return status 0 for local resources.
        if (xhr.status && xhr.status >= 400) {
          reject(new Error(`Failed to download image: HTTP ${xhr.status}`));
          return;
        }
        resolve(xhr.response as Blob);
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }
}

export async function listCertificates(uid: string): Promise<Certificate[]> {
  if (!uid) return [];
  // Avoid Firestore query failures when `expiryDate` contains mixed types (string vs Timestamp).
  // We'll sort locally after normalizing.
  const snap = await getDocs(certsCollection(uid));
  const certs = snap.docs.map((d) => {
    const data = d.data() as any;
    const attachments = parseStoredAttachments(data.attachments);
    return {
      id: d.id,
      name: String(data.name ?? ''),
      issueDate: normalizeToISODate(data.issueDate),
      expiryDate: normalizeToISODate(data.expiryDate),
      attachments: attachments.length ? attachments : undefined,
      fileUrl: data.fileUrl ? String(data.fileUrl) : undefined,
      filePath: data.filePath ? String(data.filePath) : undefined,
      createdAt: normalizeToNumber(data.createdAt),
      updatedAt: normalizeToNumber(data.updatedAt),
    } satisfies Certificate;
  });

  return certs.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
}

export async function getCertificate(uid: string, certificateId: string): Promise<Certificate | null> {
  if (!uid || !certificateId) return null;
  const snap = await getDoc(doc(firestore, 'users', uid, 'certificates', certificateId));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  const attachments = parseStoredAttachments(data.attachments);
  return {
    id: snap.id,
    name: String(data.name ?? ''),
    issueDate: normalizeToISODate(data.issueDate),
    expiryDate: normalizeToISODate(data.expiryDate),
    attachments: attachments.length ? attachments : undefined,
    fileUrl: data.fileUrl ? String(data.fileUrl) : undefined,
    filePath: data.filePath ? String(data.filePath) : undefined,
    createdAt: normalizeToNumber(data.createdAt),
    updatedAt: normalizeToNumber(data.updatedAt),
  };
}

export async function addCertificate(
  uid: string,
  input: Pick<Certificate, 'name' | 'issueDate' | 'expiryDate'>,
): Promise<string> {
  const id = doc(certsCollection(uid)).id;
  const now = Date.now();
  const cert: Omit<Certificate, 'id'> = {
    name: input.name.trim(),
    issueDate: input.issueDate,
    expiryDate: input.expiryDate,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(firestore, 'users', uid, 'certificates', id), cert);
  return id;
}

export async function updateCertificate(
  uid: string,
  certificateId: string,
  patch: Partial<Pick<Certificate, 'name' | 'issueDate' | 'expiryDate' | 'filePath' | 'fileUrl' | 'attachments'>>,
) {
  await updateDoc(doc(firestore, 'users', uid, 'certificates', certificateId), { ...patch, updatedAt: Date.now() });
}

export async function removeCertificate(uid: string, certificateId: string) {
  const cert = await getCertificate(uid, certificateId);
  if (cert) {
    for (const a of listCertificateAttachments(cert)) {
      try {
        await deleteObject(ref(storage, a.storagePath));
      } catch {
        // eslint-disable-next-line no-console
        console.warn('Storage delete failed for attachment', a.storagePath);
      }
    }
  }
  await deleteDoc(doc(firestore, 'users', uid, 'certificates', certificateId));
}

export async function uploadCertificateAttachment(params: {
  uid: string;
  certificateId: string;
  localUri: string;
  filename: string;
  contentType?: string;
  sizeBytes?: number;
}): Promise<CertificateAttachment> {
  const blob = await uriToBlob(params.localUri);
  const id = Crypto.randomUUID();
  const safeBase = params.filename.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'file';
  const storagePath = `users/${params.uid}/certificates/${params.certificateId}/attachments/${id}-${safeBase}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob, params.contentType ? { contentType: params.contentType } : undefined);
  const url = await getDownloadURL(storageRef);

  const cert = await getCertificate(params.uid, params.certificateId);
  if (!cert) throw new Error('Certificate not found');

  const nextAttachments = [...(cert.attachments ?? [])];
  const attachment: CertificateAttachment = {
    id,
    url,
    storagePath,
    filename: params.filename,
    contentType: params.contentType,
    sizeBytes: params.sizeBytes,
  };
  nextAttachments.push(attachment);

  await updateCertificate(params.uid, params.certificateId, { attachments: nextAttachments });
  return attachment;
}

/** @deprecated Use `uploadCertificateAttachment` — kept for call sites that still use this name. */
export async function uploadCertificateFile(params: {
  uid: string;
  certificateId: string;
  localUri: string;
  filename: string;
  contentType?: string;
  sizeBytes?: number;
}) {
  return uploadCertificateAttachment(params);
}

export async function removeCertificateAttachment(uid: string, certificateId: string, attachmentId: string) {
  const cert = await getCertificate(uid, certificateId);
  if (!cert) return;

  const docRef = doc(firestore, 'users', uid, 'certificates', certificateId);

  if (attachmentId === LEGACY_CERTIFICATE_ATTACHMENT_ID) {
    if (cert.filePath) {
      try {
        await deleteObject(ref(storage, cert.filePath));
      } catch {
        // eslint-disable-next-line no-console
        console.warn('Storage delete failed for legacy attachment', cert.filePath);
      }
    }
    await updateDoc(docRef, {
      fileUrl: deleteField(),
      filePath: deleteField(),
      updatedAt: Date.now(),
    });
    return;
  }

  const att = cert.attachments?.find((a) => a.id === attachmentId);
  if (att?.storagePath) {
    try {
      await deleteObject(ref(storage, att.storagePath));
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Storage delete failed for attachment', att.storagePath);
    }
  }

  const remaining = (cert.attachments ?? []).filter((a) => a.id !== attachmentId);
  await updateDoc(docRef, {
    attachments: remaining.length ? remaining : deleteField(),
    updatedAt: Date.now(),
  });
}

export async function seedSampleCertificates(uid: string): Promise<void> {
  // Seed only for an authenticated user.
  if (!uid) return;

  const now = dayjs();
  const image = await getOrCreateSampleCertificateImage();

  const samples: Array<Pick<Certificate, 'name' | 'issueDate' | 'expiryDate'>> = [
    {
      name: 'STCW Basic Safety Training',
      issueDate: now.subtract(1, 'year').format('YYYY-MM-DD'),
      expiryDate: now.add(90, 'day').format('YYYY-MM-DD'), // valid
    },
    {
      name: 'Medical Fitness Certificate',
      issueDate: now.subtract(6, 'month').format('YYYY-MM-DD'),
      expiryDate: now.add(10, 'day').format('YYYY-MM-DD'), // warning
    },
    {
      name: 'Proficiency in Survival Craft',
      issueDate: now.subtract(2, 'year').format('YYYY-MM-DD'),
      expiryDate: now.subtract(15, 'day').format('YYYY-MM-DD'), // expired
    },
  ];

  // Append 3 sample certificates.
  for (const sample of samples) {
    const certificateId = await addCertificate(uid, sample);
    await uploadCertificateAttachment({
      uid,
      certificateId,
      localUri: image.localUri,
      filename: image.filename,
      contentType: image.contentType,
    });
  }
}

