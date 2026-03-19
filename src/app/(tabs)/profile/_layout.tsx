import { Stack } from 'expo-router';
import { Colors } from '../../../shared/utils/colors';

export default function ProfileStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerShown: false,
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="tips" options={{ title: 'Tips' }} />
      <Stack.Screen name="tips/[postId]" options={{ title: 'Tip' }} />
    </Stack>
  );
}

