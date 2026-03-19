import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { TextField } from '../../../shared/components/TextField';
import { Button } from '../../../shared/components/Button';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';
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
      <View style={styles.section}>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.meta}>Subscription: {isPremium ? 'Premium' : 'Free'}</Text>
      </View>

      <Card style={styles.card}>
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
              Alert.alert("Couldn't save", 'Please try again.');
            } finally {
              setSaving(false);
            }
          }}
        />
      </Card>

      <View style={styles.gap} />

      <Button title="Tips & content" variant="secondary" onPress={() => router.push('/(tabs)/profile/tips')} />

      <View style={styles.gap} />

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
                router.replace('/(auth)/welcome');
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.sectionGap,
    gap: Spacing.xs,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.headingSize,
    fontWeight: Typography.heroWeight,
  },
  meta: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: '800',
  },
  card: {
    gap: Spacing.itemGap,
    marginBottom: Spacing.itemGap,
  },
  gap: {
    height: Spacing.itemGap,
  },
});
