import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import dayjs from 'dayjs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAuth } from '../../../features/auth/AuthProvider';
import {
  useCertificate,
  useUpdateCertificate,
  useUploadCertificateFile,
} from '../../../features/certificates/certificatesHooks';
import { getCertificateStatus } from '../../../features/certificates/certificateStatus';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';
import { isValidISODate } from '../../../shared/utils/validation';

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
  const status = getCertificateStatus(expiryDate);
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
        <Text style={styles.dateValue}>{issueDate}</Text>
        <Text style={styles.dateValue}>{expiryDate}</Text>
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
          tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
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

  const imageUri = useMemo(() => {
    if (!cert?.fileUrl) return undefined;
    const candidate = cert.filePath ?? cert.fileUrl;
    const isImage = /\.(png|jpe?g|webp|gif)$/i.test(candidate);
    return isImage ? cert.fileUrl : undefined;
  }, [cert?.filePath, cert?.fileUrl]);

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

        <View style={styles.hero}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderText}>No image attached</Text>
            </View>
          )}
        </View>

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
          <Text style={styles.sectionLabel}>Attachment</Text>
          {cert.fileUrl ? (
            <View style={styles.row}>
              <Text style={styles.meta} numberOfLines={1}>
                File uploaded
              </Text>
              <Button
                title="Open"
                variant="secondary"
                onPress={() => Linking.openURL(cert.fileUrl!)}
                style={styles.openBtn}
              />
            </View>
          ) : (
            <Text style={styles.meta}>No file uploaded yet.</Text>
          )}
          <Button
            title="Upload file"
            variant="secondary"
            loading={uploadMut.isPending}
            onPress={async () => {
              const res = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
              });
              if (res.canceled) return;
              const file = res.assets[0];
              if (!file?.uri) return;
              const mimeType = file.mimeType ?? '';
              const ext = mimeType.includes('png')
                ? 'png'
                : mimeType.includes('jpeg') || mimeType.includes('jpg')
                  ? 'jpg'
                  : mimeType.includes('webp')
                    ? 'webp'
                    : mimeType.includes('gif')
                      ? 'gif'
                      : '';
              const filename = file.name ?? `certificate${ext ? `.${ext}` : ''}`;
              uploadMut.mutate(
                {
                  localUri: file.uri,
                  filename,
                  contentType: mimeType || undefined,
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
  openBtn: { width: 110 },
  primaryBtn: { marginBottom: Spacing.sm },
  secondaryBtn: { marginBottom: Spacing.sm },
  gap: { height: Spacing.itemGap },
});
