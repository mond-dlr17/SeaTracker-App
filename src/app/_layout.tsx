// Must load first so Reactotron connects before other app code
if (__DEV__) {
  require('../../ReactotronConfig');
}

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '../core/providers/AppProviders';
import { useAuth } from '../features/auth/AuthProvider';
import { LoadingScreen } from '../shared/components/LoadingScreen';
import { Colors } from '../shared/utils/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar style="dark" />
        <AuthGate />
      </AppProviders>
    </SafeAreaProvider>
  );
}

function AuthGate() {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome');
      return;
    }
    if (user && inAuthGroup) {
      router.replace('/(tabs)/certificates');
    }
  }, [initializing, router, segments, user]);

  if (initializing) return <LoadingScreen title="Loading SeaTrack…" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="upgrade-premium"
        options={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      />
    </Stack>
  );
}

