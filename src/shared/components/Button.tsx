import { Pressable, StyleSheet, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { Colors } from '../utils/colors';
import { Radius, Spacing, Typography } from '../utils/theme';

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
  fullWidth,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  fullWidth?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth !== false && styles.fullWidth,
        variantStyles[variant],
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.text} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border },
  danger: { backgroundColor: Colors.expired },
});

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: { width: '100%' },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSecondary: { color: Colors.text },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
});
