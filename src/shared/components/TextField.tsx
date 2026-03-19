import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../utils/colors';
import { Radius, Spacing, Typography } from '../utils/theme';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.fieldGap },
  label: {
    color: Colors.muted,
    fontWeight: Typography.labelWeight,
    fontSize: Typography.labelSize,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.bodySize,
  },
});
