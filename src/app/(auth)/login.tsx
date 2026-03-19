import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';

import { Screen } from '../../shared/components/Screen';
import { Card } from '../../shared/components/Card';
import { TextField } from '../../shared/components/TextField';
import { Button } from '../../shared/components/Button';
import { Colors } from '../../shared/utils/colors';
import { Spacing, Typography } from '../../shared/utils/theme';
import { loginWithEmail } from '../../features/auth/authService';
import Ionicons from '@expo/vector-icons/build/Ionicons';

export default function LoginRoute() {
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
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.accent} />
            <Text style={styles.backLink}>Back to welcome</Text>
          </Pressable>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Log In</Text>

          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

          <Button
            title="Continue with Email"
            loading={loading}
            onPress={async () => {
              try {
                setLoading(true);
                await loginWithEmail(email, password);
              } catch (e) {
                const message = e instanceof Error ? e.message : 'Check your email/password and try again.';
                Alert.alert('Login failed', message);
              } finally {
                setLoading(false);
              }
            }}
          />

          <View style={styles.row}>
            <Text style={styles.muted}>New here?</Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.link}>Create account</Text>
            </Link>
          </View>
        </Card>

        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Link href="/" asChild>
            <Text style={styles.termsLink}>Terms of Service</Text>
          </Link>{' '}
          and{' '}
          <Link href="/" asChild>
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Link>
          .
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.sectionGap,
  },
  card: {
    gap: Spacing.itemGap,
    marginBottom: Spacing.sectionGap,
  },
  backLink: {
    color: Colors.accent,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: Typography.titleSize,
    fontWeight: Typography.titleWeight,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  muted: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  link: {
    color: Colors.accent,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  termsText: {
    color: Colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 6,
    marginTop: Spacing.sm,
  },
  termsLink: {
    color: Colors.text,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: Colors.border,
  },
});
