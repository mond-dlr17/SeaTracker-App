import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../utils/colors';

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: 16,
  },
});

