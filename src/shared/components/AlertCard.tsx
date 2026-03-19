import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Colors } from '../utils/colors';

type Tone = 'warning' | 'error' | 'info';

const toneStyles: Record<Tone, { bg: string; iconColor: string }> = {
  warning: { bg: '#FEF3C7', iconColor: Colors.warning },
  error: { bg: '#FEE2E2', iconColor: Colors.expired },
  info: { bg: '#DBEAFE', iconColor: Colors.accent },
};

export function AlertCard({
  message,
  tone = 'warning',
  children,
  style,
}: PropsWithChildren<{ message: string; tone?: Tone; style?: ViewStyle }>) {
  const { bg } = toneStyles[tone];
  return (
    <View style={[styles.card, { backgroundColor: bg }, style]}>
      <Text style={styles.message}>{message}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.button,
    padding: Spacing.cardPadding,
    width: '100%',
  },
  message: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
