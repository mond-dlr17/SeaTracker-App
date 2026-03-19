import { Stack } from 'expo-router';
import { Colors } from '../../../shared/utils/colors';

export default function TrainingStackLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Training' }} />
    </Stack>
  );
}

