import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../utils/colors';

export function Badge({ label, tone }: { label: string; tone: 'green' | 'yellow' | 'red' | 'blue' }) {
  const bg =
    tone === 'green' ? Colors.green : tone === 'yellow' ? Colors.yellow : tone === 'red' ? Colors.red : Colors.blue;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: {
    color: Colors.bg,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});

