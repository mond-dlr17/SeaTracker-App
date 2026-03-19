import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { Screen } from '../../shared/components/Screen';
import { Card } from '../../shared/components/Card';
import { TextField } from '../../shared/components/TextField';
import { Button } from '../../shared/components/Button';
import { Colors } from '../../shared/utils/colors';
import { Spacing, Typography } from '../../shared/utils/theme';
import { registerWithEmail } from '../../features/auth/authService';

export default function RegisterRoute() {
  const [fullName, setFullName] = useState('');
  const [rank, setRank] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');
  const [vesselTypes, setVesselTypes] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>ONBOARDING</Text>
          </View>
          <Text style={styles.title}>Set your course.</Text>
          <Text style={styles.subtitle}>Create your profile to track certificates and sea time.</Text>
        </View>

        <Card style={styles.card}>
          <TextField label="Full name" value={fullName} onChangeText={setFullName} />
          <TextField label="Current rank" value={rank} onChangeText={setRank} placeholder="e.g. 2nd Officer" />
          <TextField
            label="Years of sea time"
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            keyboardType="numeric"
          />
          <TextField
            label="Vessel experience"
            value={vesselTypes}
            onChangeText={setVesselTypes}
            placeholder="e.g. Tanker, Cargo, Bulker"
          />
          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button
            title="Create Profile"
            loading={loading}
            onPress={async () => {
              const years = Number(yearsOfExperience);
              if (!fullName.trim()) return Alert.alert('Missing name', 'Please enter your full name.');
              if (!email.trim()) return Alert.alert('Missing email', 'Please enter an email address.');
              if (!password || password.length < 6)
                return Alert.alert('Weak password', 'Use at least 6 characters.');
              if (!Number.isFinite(years) || years < 0)
                return Alert.alert('Invalid years', 'Enter a valid number.');

              try {
                setLoading(true);
                await registerWithEmail({
                  email,
                  password,
                  fullName,
                  rank,
                  yearsOfExperience: years,
                  vesselTypes: vesselTypes
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
              } catch (e) {
                const message = e instanceof Error ? e.message : 'Please try again.';
                Alert.alert('Registration failed', message);
              } finally {
                setLoading(false);
              }
            }}
          />
          <Link href="/(auth)/login" asChild>
            <Text style={styles.link}>Back to login</Text>
          </Link>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.sectionGap,
    gap: Spacing.sm,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
  },
  pillText: {
    color: Colors.accent,
    fontSize: Typography.labelSize,
    fontWeight: Typography.labelWeight,
    letterSpacing: 0.5,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.heroSize,
    fontWeight: Typography.heroWeight,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    lineHeight: 22,
  },
  card: {
    gap: Spacing.itemGap,
  },
  link: {
    color: Colors.accent,
    fontSize: Typography.bodySize,
    fontWeight: '700',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
