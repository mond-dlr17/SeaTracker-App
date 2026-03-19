import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ActivityIndicator, View, type TextStyle, type ViewStyle } from 'react-native';
import { Colors } from '../utils/colors';
import { Radius, Spacing } from '../utils/theme';

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
  fullWidth,
  iconLeft,
  iconRight,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  textStyle?: TextStyle;
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
        <View style={styles.contentRow}>
          {iconLeft ? <View style={styles.iconLeftWrap}>{iconLeft}</View> : null}
          <Text style={[styles.text, variant === 'secondary' && styles.textSecondary, textStyle]}>{title}</Text>
          {iconRight ? <View style={styles.iconRightWrap}>{iconRight}</View> : null}
        </View>
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
    minHeight: 56,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: { width: '100%' },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeftWrap: {
    marginRight: Spacing.sm,
  },
  iconRightWrap: {
    marginLeft: Spacing.sm,
  },
  text: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  textSecondary: { color: Colors.text },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
});
