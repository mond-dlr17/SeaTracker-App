import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../../features/auth/AuthProvider';
import { useAddCertificate, useCertificates } from '../../../features/certificates/certificatesHooks';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';
import { isValidISODate } from '../../../shared/utils/validation';

export default function AddCertificateRoute() {
  const { user, profile } = useAuth();
  const uid = user?.uid ?? '';
  const certsQuery = useCertificates(uid);
  const addMut = useAddCertificate(uid);

  const [name, setName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const isPremium = !!profile?.isPremium;
  const certCount = certsQuery.data?.length ?? 0;
  const blocked = !isPremium && certCount >= 3;

  const helper = useMemo(() => {
    if (isPremium) return null;
    return (
      <Text style={styles.helper}>
        Free plan: up to 3 certificates ({certCount}/3). Upgrade to Premium for unlimited.
      </Text>
    );
  }, [certCount, isPremium]);

  if (!uid) return null;

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
          <View style={styles.uploadZone}>
            <Text style={styles.uploadText}>Scan or upload file (PDF, PNG, or JPG up to 10MB)</Text>
          </View>
          <Button
            title="Save Certificate"
            disabled={blocked}
            loading={addMut.isPending}
            onPress={() => {
              if (!name.trim()) return Alert.alert('Missing name', 'Please enter a certificate name.');
              if (!isValidISODate(issueDate)) return Alert.alert('Invalid issue date', 'Use format YYYY-MM-DD.');
              if (!isValidISODate(expiryDate)) return Alert.alert('Invalid expiry date', 'Use format YYYY-MM-DD.');
              addMut.mutate(
                { name, issueDate, expiryDate },
                {
                  onSuccess: (certificateId) => {
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
  },
  helper: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
});
