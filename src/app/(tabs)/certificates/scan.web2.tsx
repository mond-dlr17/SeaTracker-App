import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../shared/components/Button';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';

export default function ScanCertificateWebFallback() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }]}>
      <Text style={styles.title}>Scanning</Text>
      <Text style={styles.body}>Document scanning runs in the iOS or Android app (dev build).</Text>
      <Button title="Go back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    gap: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: Typography.headingSize,
    fontWeight: Typography.titleWeight,
  },
  body: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    marginBottom: Spacing.sm,
  },
});
