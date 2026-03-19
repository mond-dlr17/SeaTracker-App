import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Link } from 'expo-router';

import { Screen } from '../../shared/components/Screen';
import { Card } from '../../shared/components/Card';
import { TextField } from '../../shared/components/TextField';
import { Button } from '../../shared/components/Button';
import { Colors } from '../../shared/utils/colors';
import { Spacing, Typography } from '../../shared/utils/theme';
import { loginWithEmail, loginWithGoogleIdToken } from '../../features/auth/authService';
import { WelcomeCompassSvg } from '../../shared/components/WelcomeCompassSvg';

export default function LoginRoute() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const GOOGLE_OAUTH_CLIENT_ID = '994477421599-gc9f6m97skvni8l56id0u64uhlt9k3kf.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_OAUTH_CLIENT_ID,
    androidClientId: GOOGLE_OAUTH_CLIENT_ID,
    webClientId: GOOGLE_OAUTH_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    if (!response || response.type !== 'success') return;

    const idToken = (response.params as any)?.id_token as string | undefined;
    if (!idToken) {
      Alert.alert('Google sign-in failed', 'Missing Google id token. Please try again.');
      return;
    }

    (async () => {
      try {
        setGoogleLoading(true);
        await loginWithGoogleIdToken(idToken);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Google sign-in failed. Please try again.';
        Alert.alert('Google sign-in failed', message);
      } finally {
        setGoogleLoading(false);
      }
    })();
  }, [response]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.hero}>
            <WelcomeCompassSvg size={240} />
          </View>

          <View style={styles.portOsPill}>
            <Text style={styles.portOsPillText}>PORT OS</Text>
          </View>

          <Text style={styles.title}>Track your seafarer career.</Text>
          <Text style={styles.subtitle}>Stay compliant. Stay ready. Manage documents and sea time effortlessly.</Text>
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

          <Button
            title="Continue with Google"
            disabled={!request || googleLoading}
            loading={googleLoading}
            variant="secondary"
            onPress={() => {
              if (!request) return;
              promptAsync();
            }}
          />
          <View style={styles.row}>
            <Text style={styles.muted}>New here?</Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.link}>Create account</Text>
            </Link>
          </View>
        </Card>

        <View style={styles.footer}>
          <Link href="/" asChild>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </Link>
          <Text style={styles.footerDot}> · </Text>
          <Link href="/" asChild>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Link>
        </View>
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
    alignItems: 'center',
  },
  hero: {
    marginBottom: Spacing.lg,
  },
  portOsPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    backgroundColor: Colors.surface2,
    marginBottom: Spacing.sm,
  },
  portOsPillText: {
    color: Colors.accent,
    fontWeight: Typography.labelWeight,
    fontSize: Typography.labelSize,
    letterSpacing: 0.5,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.heroSize,
    fontWeight: Typography.heroWeight,
    lineHeight: 30,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    gap: Spacing.itemGap,
    marginBottom: Spacing.sectionGap,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerLink: {
    color: Colors.muted,
    fontSize: 12,
  },
  footerDot: {
    color: Colors.muted,
    fontSize: 12,
  },
});
