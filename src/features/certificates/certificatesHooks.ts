import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Certificate } from '../../domain/models/Certificate';
import {
  addCertificate,
  getCertificate,
  listCertificates,
  removeCertificate,
  updateCertificate,
  uploadCertificateFile,
  seedSampleCertificates,
} from './certificatesService';

export function certificatesKey(uid: string) {
  return ['certificates', uid] as const;
}

export function certificateKey(uid: string, certificateId: string) {
  return ['certificates', uid, certificateId] as const;
}

export function useCertificates(uid: string) {
  return useQuery({
    queryKey: certificatesKey(uid),
    queryFn: () => listCertificates(uid),
  });
}

export function useCertificate(uid: string, certificateId: string) {
  return useQuery({
    queryKey: certificateKey(uid, certificateId),
    queryFn: () => getCertificate(uid, certificateId),
  });
}

export function useAddCertificate(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Pick<Certificate, 'name' | 'issueDate' | 'expiryDate'>) => addCertificate(uid, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: certificatesKey(uid) });
    },
  });
}

export function useUpdateCertificate(uid: string, certificateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<Certificate, 'name' | 'issueDate' | 'expiryDate' | 'fileUrl' | 'filePath'>>) =>
      updateCertificate(uid, certificateId, patch),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: certificatesKey(uid) }),
        qc.invalidateQueries({ queryKey: certificateKey(uid, certificateId) }),
      ]);
    },
  });
}

export function useRemoveCertificate(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (certificateId: string) => removeCertificate(uid, certificateId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: certificatesKey(uid) });
    },
  });
}

export function useUploadCertificateFile(uid: string, certificateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { localUri: string; filename: string; contentType?: string }) =>
      uploadCertificateFile({ uid, certificateId, ...p }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: certificatesKey(uid) }),
        qc.invalidateQueries({ queryKey: certificateKey(uid, certificateId) }),
      ]);
    },
  });
}

export function useSeedSampleCertificates(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => seedSampleCertificates(uid),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: certificatesKey(uid) });
    },
  });
}

