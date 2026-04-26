import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../utils/colors';
import { Spacing } from '../utils/theme';

export function Screen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  // Use safe-area insets so content doesn't get clipped by the notch / home indicator.
  return (
    <View
      style={styles.container}
    >
      {/* Background gradient layer (visual only) */}
      <Svg
        pointerEvents="none"
        style={styles.ambientSvg}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <Defs>
          <RadialGradient id="screenAmbientRight" cx="92%" cy="10%" r="55%">
            <Stop offset="0%" stopColor={Colors.accent} stopOpacity={0.22} />
            <Stop offset="55%" stopColor={Colors.accent} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={Colors.accent} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="screenAmbientLeft" cx="0%" cy="35%" r="45%">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.11} />
            <Stop offset="60%" stopColor={Colors.primary} stopOpacity={0.05} />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#screenAmbientRight)" />
        <Rect x="0" y="0" width="100" height="100" fill="url(#screenAmbientLeft)" />
      </Svg>

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.screenPaddingVertical,
            paddingBottom:Spacing.screenPaddingVertical,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fallback behind the SVG gradient
    overflow: 'visible',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
  },
  ambientSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
