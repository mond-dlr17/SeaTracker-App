import { Stack } from 'expo-router';

import { Colors } from '../../../../shared/utils/colors';

export default function CertificateDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="attachment/[attachmentId]"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
