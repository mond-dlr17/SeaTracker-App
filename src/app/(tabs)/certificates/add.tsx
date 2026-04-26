import { useCallback, useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

import { useAuth } from '../../../features/auth/AuthProvider';
import { useAddCertificate, useCertificates } from '../../../features/certificates/certificatesHooks';
import {
  CERTIFICATE_ATTACHMENT_PICKER_TYPES,
  isAllowedCertificateAttachment,
  normalizeAttachmentContentType,
  resolveLocalFileSizeBytes,
  validateCertificateAttachmentSize,
} from '../../../features/certificates/certificateAttachments';
import { removeCertificate, uploadCertificateFile } from '../../../features/certificates/certificatesService';
import { consumePendingCertificateScan } from '../../../features/documentScan/pendingCertificateScan';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';
import { isValidISODate } from '../../../shared/utils/validation';

export default function AddCertificateRoute() {
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent?.();

      // Hide the bottom tabs while this screen is focused.
      parent?.setOptions?.({
        tabBarStyle: { display: 'none' },
      });

      const pending = consumePendingCertificateScan();
      if (pending) {
        if (pending.name) setName(pending.name);
        if (pending.issueDate) setIssueDate(pending.issueDate);
        if (pending.expiryDate) setExpiryDate(pending.expiryDate);
        setPickedImage({
          localUri: pending.localUri,
          filename: pending.filename,
          contentType: pending.contentType,
        });
      }

      return () => {
        // Restore tab bar style when leaving this screen.
        parent?.setOptions?.({
          tabBarStyle: {
            display: 'flex',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
        });
      };
    }, [navigation]),
  );

  const { user, profile } = useAuth();
  const uid = user?.uid ?? '';
  const certsQuery = useCertificates(uid);
  const addMut = useAddCertificate(uid);

  const [name, setName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [pickedImage, setPickedImage] = useState<null | { localUri: string; filename: string; contentType?: string }>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const isPremium = !!profile?.isPremium;
  const certCount = certsQuery.data?.length ?? 0;
  const blocked = !isPremium && certCount >= 3;

  const helper = useMemo(() => {
    if (isPremium) return null;

    return (
      <View>
        <Text style={styles.helper}>
          Free plan: up to 3 certificates ({certCount}/3). Upgrade to Premium for unlimited.
        </Text>
        {blocked && (
          <Button
            title="Upgrade to Premium"
            variant="secondary"
            onPress={() => router.push('/upgrade-premium')}
            style={styles.upgradeBtn}
          />
        )}
      </View>
    );
  }, [blocked, certCount, isPremium]);

  if (!uid) return null;

  const pickImage = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [...CERTIFICATE_ATTACHMENT_PICKER_TYPES],
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const file = res.assets[0];
    if (!file?.uri) return;

    const pickerSize = (file as { size?: number }).size;
    const sizeBytes = await resolveLocalFileSizeBytes(file.uri, pickerSize);
    if (sizeBytes == null) {
      Alert.alert(
        'Couldn’t read file size',
        'Try saving the file to your device or pick another file.',
      );
      return;
    }
    const sizeErr = validateCertificateAttachmentSize(sizeBytes);
    if (sizeErr) {
      Alert.alert('File too large', sizeErr);
      return;
    }

    const mimeType = file.mimeType ?? '';
    const filename = file.name ?? 'attachment';
    if (!isAllowedCertificateAttachment(mimeType, filename)) {
      Alert.alert('Unsupported file', 'Only PDF, PNG, JPG, JPEG, and HEIC files are allowed.');
      return;
    }

    const contentType = normalizeAttachmentContentType(mimeType, filename);
    setPickedImage({
      localUri: file.uri,
      filename,
      contentType,
    });
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Add Document</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.hint}>Add a new certificate to your vault.</Text>
        </View>

        <Card style={styles.card}>
          {helper}
          <TextField
            label="Certificate name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. STCW Basic Safety"
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <TextField
                label="Issue date (YYYY-MM-DD)"
                value={issueDate}
                onChangeText={setIssueDate}
                placeholder="2026-03-19"
              />
            </View>
            <View style={styles.half}>
              <TextField
                label="Expiry date (YYYY-MM-DD)"
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="2027-03-19"
              />
            </View>
          </View>
          {Platform.OS !== 'web' ? (
            <Button
              title="Scan with camera"
              variant="secondary"
              onPress={() => router.push('/(tabs)/certificates/scan')}
              disabled={blocked}
            />
          ) : null}
          <Pressable onPress={pickImage} style={styles.uploadZone}>
            {pickedImage ? (
              <View style={styles.previewInner}>
                {pickedImage.contentType?.includes('pdf') ? (
                  <View style={styles.pdfPreview}>
                    <Text style={styles.pdfPreviewText} numberOfLines={2}>
                      {pickedImage.filename}
                    </Text>
                    <Text style={styles.pdfPreviewHint}>PDF (preview after save)</Text>
                  </View>
                ) : (
                  <Image source={{ uri: pickedImage.localUri }} style={styles.previewImage} />
                )}
                <Text style={styles.previewText} numberOfLines={1}>
                  {pickedImage.filename}
                </Text>
                <Text style={styles.previewHint}>Tap to replace</Text>
              </View>
            ) : (
              <Text style={styles.uploadText}>
                Scan or upload a file (PDF, PNG, JPG, JPEG, or HEIC — up to 3MB)
              </Text>
            )}
          </Pressable>
          <Button
            title={blocked ? 'Upgrade to Premium' : 'Save Certificate'}
            disabled={addMut.isPending || imageUploading}
            loading={addMut.isPending || imageUploading}
            onPress={() => {
              if (blocked) {
                router.push('/upgrade-premium');
                return;
              }
              if (!name.trim()) return Alert.alert('Missing name', 'Please enter a certificate name.');
              if (!isValidISODate(issueDate)) return Alert.alert('Invalid issue date', 'Use format YYYY-MM-DD.');
              if (!isValidISODate(expiryDate)) return Alert.alert('Invalid expiry date', 'Use format YYYY-MM-DD.');
              addMut.mutate(
                { name, issueDate, expiryDate },
                {
                  onSuccess: async (certificateId) => {
                    if (pickedImage) {
                      setImageUploading(true);
                      try {
                        const sizeBytes = await resolveLocalFileSizeBytes(pickedImage.localUri);
                        await uploadCertificateFile({
                          uid,
                          certificateId,
                          localUri: pickedImage.localUri,
                          filename: pickedImage.filename,
                          contentType: pickedImage.contentType,
                          sizeBytes: sizeBytes ?? undefined,
                        });
                      } catch (e) {
                        // Best-effort cleanup so users don't end up with an orphan cert without photo.
                        // eslint-disable-next-line no-console
                        console.error('uploadCertificateFile failed:', e);
                        try {
                          await removeCertificate(uid, certificateId);
                        } catch {
                          // eslint-disable-next-line no-console
                          console.warn('removeCertificate cleanup failed; keeping orphan cert.', e);
                        }
                        Alert.alert('Couldn’t upload image', 'Please try again and make sure the file is accessible on your device.');
                        return;
                      } finally {
                        setImageUploading(false);
                      }
                    }
                    router.replace(`/(tabs)/certificates/${certificateId}`);
                  },
                  onError: (e) => {
                    // Helpful for debugging permission/rules errors.
                    // eslint-disable-next-line no-console
                    console.error('addCertificate failed:', e);
                    Alert.alert('Couldn’t save certificate', String((e as any)?.message ?? 'Please try again.'));
                  },
                },
              );
            }}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  screenTitle: {
    color: Colors.text,
    fontSize: Typography.headingSize,
    fontWeight: Typography.titleWeight,
  },
  closeBtn: { padding: Spacing.xs },
  closeText: { color: Colors.muted, fontSize: 20, fontWeight: '600' },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.sectionGap,
    gap: Spacing.xs,
  },
  hint: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
  },
  card: {
    gap: Spacing.itemGap,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewInner: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previewImage: {
    width: 140,
    height: 90,
    borderRadius: 8,
    backgroundColor: Colors.surface2,
  },
  pdfPreview: {
    width: '100%',
    minHeight: 90,
    borderRadius: 8,
    backgroundColor: Colors.surface2,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pdfPreviewText: {
    color: Colors.text,
    fontSize: Typography.bodySize,
    fontWeight: '700',
    textAlign: 'center',
  },
  pdfPreviewHint: {
    color: Colors.muted,
    fontSize: Typography.labelSize,
    fontWeight: '600',
  },
  previewText: {
    color: Colors.text,
    fontSize: Typography.bodySize,
    fontWeight: '700',
    maxWidth: '100%',
  },
  previewHint: {
    color: Colors.accent,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  helper: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },

  upgradeBtn: {
    marginTop: Spacing.sm,
    borderRadius: 16,
    minHeight: 50,
  },
});
