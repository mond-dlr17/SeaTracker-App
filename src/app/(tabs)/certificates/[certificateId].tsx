import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

import { useAuth } from '../../../features/auth/AuthProvider';
import { useCertificate, useUpdateCertificate, useUploadCertificateFile } from '../../../features/certificates/certificatesHooks';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Colors } from '../../../shared/utils/colors';
import { isValidISODate } from '../../../shared/utils/validation';

export default function EditCertificateRoute() {
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

  useEffect(() => {
    if (!cert) return;
    setName(cert.name);
    setIssueDate(cert.issueDate);
    setExpiryDate(cert.expiryDate);
  }, [cert?.id]);

  if (!uid) return null;

  if (certQuery.isLoading) {
    return (
      <Screen>
        <Text style={styles.muted}>Loading…</Text>
      </Screen>
    );
  }

  if (!cert) {
    return (
      <Screen>
        <Card style={{ gap: 10 }}>
          <Text style={styles.title}>Certificate not found</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>Edit details</Text>
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
            updateMut.mutate({ name, issueDate, expiryDate }, { onError: () => Alert.alert('Couldn’t update', 'Please try again.') });
          }}
        />
      </Card>

      <View style={{ height: 12 }} />

      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>Attachment</Text>

        {cert.fileUrl ? (
          <View style={styles.row}>
            <Text style={styles.meta} numberOfLines={1}>
              Uploaded
            </Text>
            <Button title="Open" variant="secondary" onPress={() => Linking.openURL(cert.fileUrl!)} style={{ width: 110 }} />
          </View>
        ) : (
          <Text style={styles.meta}>No file uploaded yet.</Text>
        )}

        <Button
          title="Upload file"
          loading={uploadMut.isPending}
          onPress={async () => {
            const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
            if (res.canceled) return;
            const file = res.assets[0];
            if (!file?.uri) return;
            const filename = file.name ?? 'certificate';
            uploadMut.mutate({ localUri: file.uri, filename, contentType: file.mimeType ?? undefined }, { onError: () => Alert.alert('Upload failed', 'Please try again.') });
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 18, fontWeight: '900' },
  meta: { color: Colors.muted, fontWeight: '700' },
  muted: { color: Colors.muted, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
});

