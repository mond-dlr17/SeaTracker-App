import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../utils/colors';

export function LoadingScreen({ title }: { title?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.blue} />
      <Text style={styles.text}>{title ?? 'Loading…'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg, gap: 10 },
  text: { color: Colors.muted, fontWeight: '700' },
});

