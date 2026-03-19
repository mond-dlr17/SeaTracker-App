import dayjs from 'dayjs';
import * as FileSystem from 'expo-file-system/legacy';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import type { Certificate } from '../../domain/models/Certificate';
import { firestore, storage } from '../../shared/services/firebase';

function certsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'certificates');
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

export async function listCertificates(uid: string): Promise<Certificate[]> {
  const q = query(certsCollection(uid), orderBy('expiryDate', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Certificate, 'id'>) }));
}

export async function getCertificate(uid: string, certificateId: string): Promise<Certificate | null> {
  const snap = await getDoc(doc(firestore, 'users', uid, 'certificates', certificateId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Certificate, 'id'>) };
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
  patch: Partial<Pick<Certificate, 'name' | 'issueDate' | 'expiryDate' | 'filePath' | 'fileUrl'>>,
) {
  await updateDoc(doc(firestore, 'users', uid, 'certificates', certificateId), { ...patch, updatedAt: Date.now() });
}

export async function removeCertificate(uid: string, certificateId: string) {
  await deleteDoc(doc(firestore, 'users', uid, 'certificates', certificateId));
}

export async function uploadCertificateFile(params: {
  uid: string;
  certificateId: string;
  localUri: string;
  filename: string;
  contentType?: string;
}) {
  const res = await fetch(params.localUri);
  const blob = await res.blob();
  const path = `users/${params.uid}/certificates/${params.certificateId}/${params.filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob, params.contentType ? { contentType: params.contentType } : undefined);
  const url = await getDownloadURL(storageRef);

  await updateCertificate(params.uid, params.certificateId, { filePath: path, fileUrl: url });
  return { path, url };
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
    await uploadCertificateFile({
      uid,
      certificateId,
      localUri: image.localUri,
      filename: image.filename,
      contentType: image.contentType,
    });
  }
}

