import { Stack } from 'expo-router';
import { Colors } from '../../../shared/utils/colors';

export default function CertificatesStackLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Certificates' }} />
      <Stack.Screen name="add" options={{ title: 'Add certificate' }} />
      <Stack.Screen name="[certificateId]" options={{ title: 'Edit certificate' }} />
    </Stack>
  );
}

