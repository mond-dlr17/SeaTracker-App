import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../utils/colors';
import { Spacing } from '../utils/theme';

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.screenPaddingVertical,
    paddingBottom: Spacing.screenPaddingVertical,
  },
});
