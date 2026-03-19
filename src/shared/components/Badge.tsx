import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../utils/colors';
import { Radius } from '../utils/theme';

const toneConfig = {
  green: { bg: Colors.valid, text: Colors.white },
  yellow: { bg: Colors.warning, text: Colors.white },
  red: { bg: Colors.expired, text: Colors.white },
  blue: { bg: Colors.accent, text: Colors.white },
} as const;

export function Badge({ label, tone }: { label: string; tone: 'green' | 'yellow' | 'red' | 'blue' }) {
  const { bg, text } = toneConfig[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  text: {
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
