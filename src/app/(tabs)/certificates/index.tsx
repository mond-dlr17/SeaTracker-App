import { useEffect, useRef } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../../features/auth/AuthProvider';
import { useCertificates, useRemoveCertificate, useSeedSampleCertificates } from '../../../features/certificates/certificatesHooks';
import { getCertificateStatus } from '../../../features/certificates/certificateStatus';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { AlertCard } from '../../../shared/components/AlertCard';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';

export default function CertificateListRoute() {
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  const certsQuery = useCertificates(uid);
  const removeMut = useRemoveCertificate(uid);
  const seedMut = useSeedSampleCertificates(uid);
  const hasAutoSeededRef = useRef(false);

  const data = certsQuery.data ?? [];
  const warningCount = data.filter((c) => getCertificateStatus(c.expiryDate) === 'warning').length;
  const expiredCount = data.filter((c) => getCertificateStatus(c.expiryDate) === 'expired').length;
  const alertCount = warningCount + expiredCount;

  if (!uid) return null;

  useEffect(() => {
    // Developer convenience: auto-seed samples once for demo/testing.
    if (!__DEV__) return;
    if (certsQuery.isLoading || certsQuery.isError) return;
    if (!uid) return;
    if (data.length > 0) return;
    if (seedMut.isPending) return;
    if (hasAutoSeededRef.current) return;
    hasAutoSeededRef.current = true;
    seedMut.mutate();
  }, [certsQuery.isError, certsQuery.isLoading, data.length, seedMut.isPending, uid]);

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={certsQuery.isFetching}
            onRefresh={() => certsQuery.refetch()}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.overline}>MARITIME COMMAND</Text>
            <Text style={styles.greeting}>Good morning, Captain 👋</Text>
            {alertCount > 0 && (
              <AlertCard
                tone={expiredCount > 0 ? 'error' : 'warning'}
                message={`${alertCount} Certificate${alertCount !== 1 ? 's' : ''} ${expiredCount > 0 ? 'Expired' : 'Warning'}.`}
                style={styles.alertCard}
              />
            )}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Vault</Text>
              <Text style={styles.filterLink}>Filter</Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const status = getCertificateStatus(item.expiryDate);
          const tone = status === 'valid' ? 'green' : status === 'warning' ? 'yellow' : 'red';
          const label = status === 'valid' ? 'VALID' : status === 'warning' ? 'WARNING' : 'EXPIRED';

          return (
            <Card style={styles.certCard} onPress={() => router.push(`/(tabs)/certificates/${item.id}`)}>
              <View style={styles.row}>
                <View style={styles.certIcon} />
                <View style={styles.certInfo}>
                  <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.meta}>Expires {item.expiryDate}</Text>
                </View>
                <Badge label={label} tone={tone} />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          certsQuery.isLoading ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : certsQuery.isError ? (
            <Text style={styles.muted}>
              Couldn't load certificates: {String((certsQuery.error as any)?.message ?? 'Unknown error')}
            </Text>
          ) : (
            <Card>
              <Text style={styles.title}>No certificates yet</Text>
              <Text style={styles.meta}>Add your first certificate to track expiry dates.</Text>
              <Button
                title={seedMut.isPending ? 'Adding samples…' : 'Add sample certificates'}
                loading={seedMut.isPending}
                onPress={() => seedMut.mutate()}
                style={styles.addBtn}
              />
              <Button
                title="Add certificate"
                onPress={() => router.push('/(tabs)/certificates/add')}
                style={styles.addBtn}
              />
            </Card>
          )
        }
      />
      <View style={styles.fabWrap} pointerEvents="box-none">
        <Pressable onPress={() => router.push('/(tabs)/certificates/add')} style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.sectionGap,
    gap: Spacing.sm,
  },
  overline: {
    color: Colors.muted,
    fontSize: Typography.labelSize,
    fontWeight: Typography.labelWeight,
    letterSpacing: 1,
  },
  greeting: {
    color: Colors.text,
    fontSize: Typography.headingSize,
    fontWeight: Typography.heroWeight,
  },
  alertCard: {
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.titleSize,
    fontWeight: Typography.titleWeight,
  },
  filterLink: {
    color: Colors.accent,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: Spacing.xxl + 56,
    gap: Spacing.itemGap,
  },
  certCard: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  certIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface2,
  },
  certInfo: { flex: 1, minWidth: 0 },
  title: {
    color: Colors.text,
    fontSize: Typography.titleSize,
    fontWeight: Typography.titleWeight,
  },
  meta: {
    color: Colors.muted,
    marginTop: 2,
    fontSize: Typography.bodySize,
    fontWeight: Typography.bodyWeight,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: { flex: 1 },
  addBtn: { marginTop: Spacing.md },
  muted: {
    color: Colors.muted,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  fabWrap: {
    position: 'absolute',
    right: Spacing.screenPaddingHorizontal,
    bottom: Spacing.xl + 24,
    alignSelf: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});
