import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Screen } from '../../shared/components/Screen';
import { Card } from '../../shared/components/Card';
import { TextField } from '../../shared/components/TextField';
import { Button } from '../../shared/components/Button';
import { Colors } from '../../shared/utils/colors';
import { Radius, Spacing, Typography } from '../../shared/utils/theme';
import { registerWithEmail } from '../../features/auth/authService';

export default function RegisterRoute() {
  const [fullName, setFullName] = useState('');
  const [rank, setRank] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');
  const [selectedVesselTypes, setSelectedVesselTypes] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const vesselTypeOptions = ['Tanker', 'Cargo', 'Bulker', 'Passenger', 'Offshore', 'LNG/LPG'] as const;

  const toggleVesselType = (vesselType: string) => {
    setSelectedVesselTypes((prev) => (prev.includes(vesselType) ? prev.filter((t) => t !== vesselType) : [...prev, vesselType]));
  };

  const submit = async () => {
    const years = Number(yearsOfExperience);
    if (!fullName.trim()) return Alert.alert('Missing name', 'Please enter your full name.');
    if (!email.trim()) return Alert.alert('Missing email', 'Please enter an email address.');
    if (!password || password.length < 6) return Alert.alert('Weak password', 'Use at least 6 characters.');
    if (!Number.isFinite(years) || years < 0) return Alert.alert('Invalid years', 'Enter a valid number.');

    try {
      setLoading(true);
      await registerWithEmail({
        email,
        password,
        fullName,
        rank,
        yearsOfExperience: years,
        vesselTypes: selectedVesselTypes,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Please try again.';
      Alert.alert('Registration failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
        >
          <View style={styles.topBar}>
            <Pressable hitSlop={12} onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.accent} />
            </Pressable>

            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotInactive]} />
              <View style={[styles.dot, styles.dotInactive]} />
            </View>

            <View style={styles.backBtnPlaceholder} />
          </View>

          <View style={styles.header}>
            <View style={styles.pill}>
              <Ionicons name="compass" size={14} color={Colors.accent} />
              <Text style={styles.pillText}>Onboarding</Text>
            </View>

            <Text style={styles.title}>Set your course</Text>
            <Text style={styles.subtitle}>Let's personalize your career dashboard and compliance alerts.</Text>
          </View>

          <Card style={styles.card}>
            <TextField label="Full Name" value={fullName} onChangeText={setFullName} placeholder="e.g. Capt. James Thorne" />
            <TextField
              label="Current Rank"
              value={rank}
              onChangeText={setRank}
              placeholder="e.g. Master Mariner"
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Years of Sea Time</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  value={yearsOfExperience}
                  onChangeText={(t) => setYearsOfExperience(t.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  placeholderTextColor={Colors.muted}
                  keyboardType="numeric"
                  style={styles.inputWithSuffixInput}
                />
                <Text style={styles.inputSuffix}>years</Text>
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Vessel Experience</Text>
              <View style={styles.chipsWrap}>
                {vesselTypeOptions.map((vesselType) => {
                  const active = selectedVesselTypes.includes(vesselType);
                  return (
                    <Pressable
                      key={vesselType}
                      onPress={() => toggleVesselType(vesselType)}
                      style={({ pressed }) => [
                        styles.chip,
                        active && styles.chipActive,
                        pressed && !active ? styles.chipPressed : null,
                      ]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{vesselType}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@company.com" />
            <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          </Card>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        <View style={styles.footer}>
          <Svg pointerEvents="none" style={styles.footerFade} preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="footerFadeGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={Colors.bg} stopOpacity={0.98} />
                <Stop offset="60%" stopColor={Colors.bg} stopOpacity={0.55} />
                <Stop offset="100%" stopColor={Colors.bg} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#footerFadeGradient)" />
          </Svg>

          <View style={styles.footerInner}>
            <Button
              title="Create Profile"
              loading={loading}
              onPress={submit}
              iconRight={<Ionicons name="arrow-forward" size={20} color={Colors.white} />}
              style={styles.primaryCta}
            />

            <Button
              title="Skip for now"
              variant="secondary"
              onPress={() => router.replace('/(auth)/login')}
              disabled={loading}
              textStyle={styles.skipText}
              style={styles.skipBtn}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  backBtnPlaceholder: { width: 44, height: 44 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 4, borderRadius: 999, backgroundColor: Colors.surface2 },
  dotActive: { width: 24, backgroundColor: Colors.accent },
  dotInactive: { width: 8 },

  header: {
    marginBottom: Spacing.sectionGap,
    gap: Spacing.sm,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(30, 136, 229, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.20)',
  },
  pillText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: Typography.labelWeight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: Typography.heroWeight,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 17,
    lineHeight: 24,
    marginTop: -2,
  },
  card: {
    gap: Spacing.itemGap,
  },
  fieldBlock: { gap: Spacing.xs },
  fieldLabel: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: Typography.labelWeight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWithSuffix: {
    position: 'relative',
  },
  inputWithSuffixInput: {
    height: 56,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    paddingRight: 86,
  },
  inputSuffix: {
    position: 'absolute',
    right: 18,
    top: 0,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.muted,
    fontWeight: Typography.bodyWeight,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  chipPressed: { opacity: 0.92 },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  chipTextActive: {
    color: Colors.white,
  },
  footer: {
    position: 'relative',
    paddingBottom: Spacing.xxl - 4,
    paddingTop: Spacing.md,
    backgroundColor: Colors.bg,
  },
  footerFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  footerInner: { gap: Spacing.sm },
  primaryCta: {
    minHeight: 56,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  skipBtn: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  skipText: {
    color: Colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
});
