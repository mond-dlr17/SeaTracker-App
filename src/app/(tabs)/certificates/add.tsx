import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../../features/auth/AuthProvider';
import { useAddCertificate, useCertificates } from '../../../features/certificates/certificatesHooks';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Colors } from '../../../shared/utils/colors';
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
      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>Certificate details</Text>
        {helper}
        <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. STCW Basic Safety" />
        <TextField
          label="Issue date (YYYY-MM-DD)"
          value={issueDate}
          onChangeText={setIssueDate}
          placeholder="2026-03-19"
        />
        <TextField
          label="Expiry date (YYYY-MM-DD)"
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder="2027-03-19"
        />

        <Button
          title={blocked ? 'Limit reached' : 'Save'}
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
                onError: () => Alert.alert('Couldn’t save', 'Please try again.'),
              },
            );
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 18, fontWeight: '900' },
  helper: { color: Colors.muted, fontWeight: '700' },
});

