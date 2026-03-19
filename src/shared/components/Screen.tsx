import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../utils/colors';
import { Spacing } from '../utils/theme';

export function Screen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  // Use safe-area insets so content doesn't get clipped by the notch / home indicator.
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.screenPaddingVertical,
          paddingBottom: insets.bottom + Spacing.screenPaddingVertical,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
  },
});
