import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import dayjs from 'dayjs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAuth } from '../../../../features/auth/AuthProvider';
import {
  attachmentKindFromMime,
  CERTIFICATE_ATTACHMENT_PICKER_TYPES,
  firstImageAttachmentUrl,
  isAllowedCertificateAttachment,
  listCertificateAttachments,
  normalizeAttachmentContentType,
  resolveLocalFileSizeBytes,
  validateCertificateAttachmentSize,
} from '../../../../features/certificates/certificateAttachments';
import {
  useCertificate,
  useRemoveCertificateAttachment,
  useUpdateCertificate,
  useUploadCertificateFile,
  useRemoveCertificate,
} from '../../../../features/certificates/certificatesHooks';
import { getCertificateIoniconsName } from '../../../../features/certificates/certificateIcons';
import { getCertificateStatus } from '../../../../features/certificates/certificateStatus';
import { Screen } from '../../../../shared/components/Screen';
import { Card } from '../../../../shared/components/Card';
import { Button } from '../../../../shared/components/Button';
import { TextField } from '../../../../shared/components/TextField';
import { Colors } from '../../../../shared/utils/colors';
import { formatDate } from '../../../../shared/utils/formatDate';
import { Spacing, Typography } from '../../../../shared/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { isValidISODate } from '../../../../shared/utils/validation';

function RenewalTimeline({
  issueDate,
  expiryDate,
}: {
  issueDate: string;
  expiryDate: string;
}) {
  const start = dayjs(issueDate).valueOf();
  const end = dayjs(expiryDate).valueOf();
  const now = Date.now();
  const total = end - start;
  const elapsed = Math.max(0, now - start);
  const progress = total > 0 ? Math.min(1, elapsed / total) : 0;
  const status = getCertificateStatus(expiryDate,issueDate);
  const daysLeft = dayjs(expiryDate).startOf('day').diff(dayjs().startOf('day'), 'day');

  return (
    <View style={styles.timeline}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor:
                status === 'expired' ? Colors.expired : status === 'warning' ? Colors.warning : Colors.valid,
            },
          ]}
        />
      </View>
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>ISSUED ON</Text>
        <Text style={styles.dateLabel}>EXPIRES ON</Text>
      </View>
      <View style={styles.dateRow}>
        <Text style={styles.dateValue}>{formatDate(issueDate)}</Text>
        <Text style={styles.dateValue}>{formatDate(expiryDate)}</Text>
      </View>
      {status !== 'valid' && (
        <Text style={[styles.warningText, status === 'expired' && styles.warningTextExpired]}>
          {status === 'expired'
            ? 'Expired – Revalidation required'
            : `${daysLeft} days remaining | Revalidation required`}
        </Text>
      )}
    </View>
  );
}

export default function EditCertificateRoute() {
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent?.();

      // Hide the bottom tabs while this screen is focused.
      parent?.setOptions?.({
        tabBarStyle: { display: 'none' },
      });

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

  const params = useLocalSearchParams<{ certificateId: string }>();
  const certificateId = params.certificateId ?? '';

  const { user } = useAuth();
  const uid = user?.uid ?? '';

  const certQuery = useCertificate(uid, certificateId);
  const updateMut = useUpdateCertificate(uid, certificateId);
  const uploadMut = useUploadCertificateFile(uid, certificateId);
  const removeAttachmentMut = useRemoveCertificateAttachment(uid, certificateId);
  const removeMut = useRemoveCertificate(uid);

  const cert = certQuery.data ?? null;

  const [name, setName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!cert) return;
    setName(cert.name);
    setIssueDate(cert.issueDate);
    setExpiryDate(cert.expiryDate);
  }, [cert?.id]);

  const imageUri = useMemo(() => (cert ? firstImageAttachmentUrl(cert) : undefined), [cert]);

  const attachments = useMemo(() => (cert ? listCertificateAttachments(cert) : []), [cert]);

  if (!uid) return null;

  if (certQuery.isLoading) {
    return (
      <Screen>
        <Text style={styles.muted}>Loading…</Text>
      </Screen>
    );
  }

  if (certQuery.isError) {
    return (
      <Screen>
        <Card style={styles.card}>
          <Text style={styles.title}>Couldn't load certificate</Text>
          <Text style={styles.meta}>{
            String((certQuery.error as any)?.message ?? 'Unknown error')
          }</Text>
        </Card>
      </Screen>
    );
  }

  if (!cert) {
    return (
      <Screen>
        <Card style={styles.card}>
          <Text style={styles.title}>Certificate not found</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.topBarBtn}>
            <Text style={styles.topBarBack}>← Back</Text>
          </Pressable>
          <Text style={styles.topBarTitle}>Certificate Detail</Text>
          <Pressable onPress={() => setEditing(true)} style={styles.topBarBtn}>
            <Text style={styles.topBarEdit}>Edit</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.hero}
          disabled={!imageUri}
          onPress={() => {
            if (!imageUri || !cert) return;
            const match = attachments.find((a) => a.url === imageUri);
            if (match) {
              router.push(`/(tabs)/certificates/${certificateId}/attachment/${match.id}`);
            }
          }}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name={getCertificateIoniconsName(cert.name)} size={48} color={Colors.accent} />
              <Text style={styles.heroPlaceholderText}>No image attached</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.certTitle}>{cert.name}</Text>
          <Text style={styles.meta}>Certificate details</Text>
        </View>

        <Card style={styles.card}>
          <RenewalTimeline issueDate={cert.issueDate} expiryDate={cert.expiryDate} />
        </Card>

        {editing ? (
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Edit details</Text>
            <TextField label="Name" value={name} onChangeText={setName} />
            <TextField label="Issue date (YYYY-MM-DD)" value={issueDate} onChangeText={setIssueDate} />
            <TextField label="Expiry date (YYYY-MM-DD)" value={expiryDate} onChangeText={setExpiryDate} />
            <Button
              title="Save changes"
              loading={updateMut.isPending}
              onPress={() => {
                if (!name.trim()) return Alert.alert('Missing name', 'Please enter a certificate name.');
                if (!isValidISODate(issueDate)) return Alert.alert('Invalid issue date', 'Use format YYYY-MM-DD.');
                if (!isValidISODate(expiryDate)) return Alert.alert('Invalid expiry date', 'Use format YYYY-MM-DD.');
                updateMut.mutate(
                  { name, issueDate, expiryDate },
                  {
                    onSuccess: () => setEditing(false),
                    onError: () => Alert.alert("Couldn't update", 'Please try again.'),
                  },
                );
              }}
            />
            <Button title="Cancel" variant="secondary" onPress={() => setEditing(false)} />
            <Button
              title={removeMut.isPending ? 'Deleting…' : 'Delete'}
              variant="danger"
              disabled={updateMut.isPending || uploadMut.isPending || removeAttachmentMut.isPending}
              loading={removeMut.isPending}
              onPress={() => {
                Alert.alert('Delete certificate?', 'This cannot be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      removeMut.mutate(certificateId, {
                        onSuccess: () => {
                          router.replace('/(tabs)/certificates');
                        },
                        onError: () => Alert.alert("Couldn't delete", 'Please try again.'),
                      });
                    },
                  },
                ]);
              }}
              style={styles.deleteBtn}
            />
          </Card>
        ) : (
          <>
            <Button
              title="Find Refresher Courses"
              onPress={() => router.push('/(tabs)/training')}
              style={styles.primaryBtn}
            />
            <Button title="Share PDF Copy" variant="secondary" onPress={() => {}} style={styles.secondaryBtn} />
          </>
        )}

        <View style={styles.gap} />

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Attachments</Text>
          <Text style={styles.attachmentHint}>
            PDF, PNG, JPG, JPEG, or HEIC — up to 3MB each. You can add multiple files.
          </Text>
          {attachments.length === 0 ? (
            <Text style={styles.meta}>No files uploaded yet.</Text>
          ) : (
            attachments.map((a) => {
              const kind = attachmentKindFromMime(a.contentType, a.filename);
              const iconName =
                kind === 'pdf'
                  ? 'document-text-outline'
                  : kind === 'image'
                    ? 'image-outline'
                    : 'attach-outline';
              return (
                <View key={a.id} style={styles.attachmentRow}>
                  <Pressable
                    style={styles.attachmentMain}
                    onPress={() =>
                      router.push(`/(tabs)/certificates/${certificateId}/attachment/${a.id}`)
                    }
                  >
                    <Ionicons name={iconName} size={22} color={Colors.accent} />
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {a.filename}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                  </Pressable>
                  {editing ? (
                    <Pressable
                      hitSlop={10}
                      onPress={() => {
                        Alert.alert('Remove attachment?', `Remove “${a.filename}”?`, [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () =>
                              removeAttachmentMut.mutate(a.id, {
                                onError: () => Alert.alert("Couldn't remove file", 'Please try again.'),
                              }),
                          },
                        ]);
                      }}
                      style={styles.attachmentRemove}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.expired} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
          <Button
            title="Add file"
            variant="secondary"
            loading={uploadMut.isPending}
            disabled={removeAttachmentMut.isPending}
            onPress={async () => {
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
                Alert.alert(
                  'Unsupported file',
                  'Only PDF, PNG, JPG, JPEG, and HEIC files are allowed.',
                );
                return;
              }

              const contentType = normalizeAttachmentContentType(mimeType, filename);
              uploadMut.mutate(
                {
                  localUri: file.uri,
                  filename,
                  contentType,
                  sizeBytes,
                },
                { onError: () => Alert.alert('Upload failed', 'Please try again.') },
              );
            }}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  topBarBtn: { padding: Spacing.xs },
  topBarBack: { color: Colors.accent, fontSize: 16, fontWeight: '700' },
  topBarTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  topBarEdit: { color: Colors.accent, fontSize: 16, fontWeight: '700' },
  hero: {
    marginBottom: Spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroPlaceholder: {
    height: 160,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  heroPlaceholderText: {
    color: Colors.muted,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroImage: {
    width: '100%',
    height: 160,
  },
  section: {
    marginBottom: Spacing.itemGap,
  },
  certTitle: {
    color: Colors.text,
    fontSize: Typography.headingSize,
    fontWeight: Typography.heroWeight,
  },
  sectionLabel: {
    color: Colors.muted,
    fontSize: Typography.labelSize,
    fontWeight: Typography.labelWeight,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  card: {
    gap: Spacing.itemGap,
    marginBottom: Spacing.itemGap,
  },
  timeline: {
    gap: Spacing.xs,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surface2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: {
    color: Colors.muted,
    fontSize: Typography.labelSize,
    fontWeight: Typography.labelWeight,
    letterSpacing: 0.5,
  },
  dateValue: {
    color: Colors.text,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  warningText: {
    color: Colors.warning,
    fontSize: Typography.bodySize,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  warningTextExpired: {
    color: Colors.expired,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.titleSize,
    fontWeight: Typography.titleWeight,
  },
  meta: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  muted: {
    color: Colors.muted,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  attachmentHint: {
    color: Colors.muted,
    fontSize: Typography.labelSize,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  attachmentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
    paddingVertical: Spacing.xs,
  },
  attachmentName: {
    flex: 1,
    color: Colors.text,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  attachmentRemove: {
    padding: Spacing.sm,
  },
  primaryBtn: { marginBottom: Spacing.sm },
  secondaryBtn: { marginBottom: Spacing.sm },
  gap: { height: Spacing.itemGap },
  deleteBtn: { marginTop: Spacing.sm },
});
