import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useRouter, Link } from 'expo-router';

import { Screen } from '../../shared/components/Screen';
import { Button } from '../../shared/components/Button';
import { WelcomeCompassSvg } from '../../shared/components/WelcomeCompassSvg';
import { Colors } from '../../shared/utils/colors';
import { Spacing } from '../../shared/utils/theme';
import { loginWithGoogleIdToken } from '../../features/auth/authService';

export default function WelcomeRoute() {
  const router = useRouter();

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
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeftSpacer} />
          <Button
            title="Log In"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
            disabled={false}
            loading={false}
            fullWidth={false}
            style={styles.loginBtn}
            textStyle={styles.loginBtnText}
          />
        </View>

        <View style={styles.main}>
          <View style={styles.heroIllustrationWrap}>
            <View style={styles.heroGlow} />
            <WelcomeCompassSvg size={240} />
          </View>

          <View style={styles.pill}>
            <Ionicons name="compass" size={14} color={Colors.accent} />
            <Text style={styles.pillText}>PORT OS</Text>
          </View>

          <Text style={styles.title}>
            Track your seafarer{'\n'}career
          </Text>
          <Text style={styles.subtitle}>
            Stay compliant. Stay ready. Manage documents and sea time effortlessly.
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.buttons}>
            <Button
              title="Continue with Email"
              onPress={() => router.push('/(auth)/login')}
              iconLeft={<Ionicons name="mail" size={22} color={Colors.white} />}
              style={styles.primaryCta}
              textStyle={styles.primaryCtaText}
              loading={false}
            />
            <Button
              title="Continue with Google"
              variant="secondary"
              onPress={() => {
                if (!request) return;
                promptAsync();
              }}
              disabled={!request || googleLoading}
              loading={googleLoading}
              iconLeft={<Ionicons name="logo-google" size={22} color={Colors.text} />}
              style={styles.secondaryCta}
              textStyle={styles.secondaryCtaText}
            />
          </View>

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
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    gap: Spacing.sectionGap,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarLeftSpacer: {
    width: 40,
  },
  loginBtn: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(226, 232, 240, 0.5)',
    borderColor: 'rgba(226, 232, 240, 0.7)',
    borderWidth: 1,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  main: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  heroIllustrationWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(30, 136, 229, 0.10)',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(30, 136, 229, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.20)',
    marginBottom: 18,
  },
  pillText: {
    color: Colors.accent,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 41,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  footer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl - 8,
  },
  buttons: {
    gap: Spacing.sm,
  },
  primaryCta: {
    minHeight: 56,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryCtaText: {
    fontSize: 17,
    letterSpacing: 0.1,
    fontWeight: '700',
  },
  secondaryCta: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  secondaryCtaText: {
    fontSize: 17,
    letterSpacing: 0.1,
    fontWeight: '700',
  },
  termsText: {
    color: Colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 6,
  },
  termsLink: {
    color: Colors.text,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: Colors.border,
  },
});

