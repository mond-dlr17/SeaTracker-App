import { Pressable, StyleSheet, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { Colors } from '../utils/colors';

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.blue },
  secondary: { backgroundColor: Colors.surface2 },
  danger: { backgroundColor: Colors.red },
});

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
});

