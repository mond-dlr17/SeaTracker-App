import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../../features/auth/AuthProvider';
import { useCertificates, useRemoveCertificate } from '../../../features/certificates/certificatesHooks';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Colors } from '../../../shared/utils/colors';
import { getCertificateStatus } from '../../../features/certificates/certificateStatus';

export default function CertificateListRoute() {
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  const certsQuery = useCertificates(uid);
  const removeMut = useRemoveCertificate(uid);

  const data = certsQuery.data ?? [];

  if (!uid) return null;

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.h1}>Your certificates</Text>
            <Button title="Add" onPress={() => router.push('/(tabs)/certificates/add')} style={{ width: 110 }} />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        renderItem={({ item }) => {
          const status = getCertificateStatus(item.expiryDate);
          const tone = status === 'valid' ? 'green' : status === 'expiring' ? 'yellow' : 'red';
          const label = status === 'valid' ? 'Valid' : status === 'expiring' ? 'Expiring' : 'Expired';

          return (
            <Card>
              <View style={styles.row}>
                <Text style={styles.title}>{item.name}</Text>
                <Badge label={label} tone={tone} />
              </View>
              <Text style={styles.meta}>Expiry: {item.expiryDate}</Text>
              <View style={styles.actions}>
                <Button
                  title="Edit"
                  variant="secondary"
                  onPress={() => router.push(`/(tabs)/certificates/${item.id}`)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Delete"
                  variant="danger"
                  loading={removeMut.isPending && removeMut.variables === item.id}
                  onPress={() => {
                    Alert.alert('Delete certificate?', 'This cannot be undone.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeMut.mutate(item.id) },
                    ]);
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          certsQuery.isLoading ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : certsQuery.isError ? (
            <Text style={styles.muted}>Couldn’t load certificates.</Text>
          ) : (
            <Card>
              <Text style={styles.title}>No certificates yet</Text>
              <Text style={styles.meta}>Add your first certificate to track expiry dates.</Text>
              <Button
                title="Add certificate"
                onPress={() => router.push('/(tabs)/certificates/add')}
                style={{ marginTop: 12 }}
              />
            </Card>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 10, marginBottom: 10 },
  h1: { color: Colors.text, fontSize: 22, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { color: Colors.text, fontSize: 16, fontWeight: '900', flex: 1 },
  meta: { color: Colors.muted, marginTop: 8, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  muted: { color: Colors.muted, fontWeight: '700', marginTop: 12 },
});

