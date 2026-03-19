import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { TextField } from '../../../shared/components/TextField';
import { Button } from '../../../shared/components/Button';
import { Colors } from '../../../shared/utils/colors';
import { logout, updateUserProfile } from '../../../features/auth/authService';
import { ensurePushToken } from '../../../features/subscription/pushToken';

export default function ProfileRoute() {
  const { user, profile } = useAuth();
  const uid = user?.uid ?? '';

  const [fullName, setFullName] = useState('');
  const [rank, setRank] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');
  const [vesselTypes, setVesselTypes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? '');
    setRank(profile.rank ?? '');
    setYearsOfExperience(String(profile.yearsOfExperience ?? 0));
    setVesselTypes((profile.vesselTypes ?? []).join(', '));
  }, [profile?.id]);

  useEffect(() => {
    if (!uid) return;
    ensurePushToken(uid).catch(() => null);
  }, [uid]);

  if (!uid) return null;

  const isPremium = !!profile?.isPremium;

  return (
    <Screen>
      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.meta}>Subscription: {isPremium ? 'Premium' : 'Free'}</Text>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} />
        <TextField label="Rank" value={rank} onChangeText={setRank} />
        <TextField
          label="Years of experience"
          value={yearsOfExperience}
          onChangeText={setYearsOfExperience}
          keyboardType="numeric"
        />
        <TextField label="Vessel types (comma separated)" value={vesselTypes} onChangeText={setVesselTypes} />
        <Button
          title="Save"
          loading={saving}
          onPress={async () => {
            const years = Number(yearsOfExperience);
            if (!Number.isFinite(years) || years < 0) return Alert.alert('Invalid years', 'Enter a valid number.');
            try {
              setSaving(true);
              await updateUserProfile(uid, {
                fullName: fullName.trim(),
                rank: rank.trim(),
                yearsOfExperience: years,
                vesselTypes: vesselTypes
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
            } catch {
              Alert.alert('Couldn’t save', 'Please try again.');
            } finally {
              setSaving(false);
            }
          }}
        />
      </Card>

      <View style={{ height: 12 }} />

      <Button title="Tips & content" variant="secondary" onPress={() => router.push('/(tabs)/profile/tips')} />

      <View style={{ height: 12 }} />

      <Button
        title="Logout"
        variant="danger"
        onPress={() => {
          Alert.alert('Log out?', undefined, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: async () => {
                await logout();
                router.replace('/(auth)/login');
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  meta: { color: Colors.muted, fontWeight: '800' },
});

