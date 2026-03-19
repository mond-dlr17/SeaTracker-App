import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Mask,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
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
      <Svg pointerEvents="none" style={styles.topRightSvg} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          {/* Fade leftwards so the "shadow" starts at the top-right corner. */}
          <LinearGradient id="screenLinear" x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0%" stopColor="#EAF7FF" stopOpacity={1} />
            <Stop offset="42%" stopColor="#EAF7FF" stopOpacity={0.42} />
            <Stop offset="100%" stopColor="#E6F4FF" stopOpacity={0} />
          </LinearGradient>

          <RadialGradient id="screenRadial" cx="86%" cy="16%" r="78%">
            <Stop offset="0%" stopColor="#BFE6FF" stopOpacity={0.38} />
            <Stop offset="55%" stopColor="#BFE6FF" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#BFE6FF" stopOpacity={0} />
          </RadialGradient>

          {/* Dots fade out to the left using a mask gradient. */}
          <LinearGradient id="dotsMaskGradient" x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="55%" stopColor="#FFFFFF" stopOpacity={0.35} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>

          <Mask id="dotsMask" maskUnits="userSpaceOnUse">
            <Rect x="0" y="0" width="100" height="100" fill="url(#dotsMaskGradient)" />
          </Mask>

          <Pattern id="screenDots" width="9" height="9" patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="1" fill="#D9F1FF" opacity={0.32} />
          </Pattern>
        </Defs>

        <Rect x="0" y="0" width="100" height="100" fill="url(#screenLinear)" />
        <Rect x="0" y="0" width="100" height="100" fill="url(#screenRadial)" />
        <Rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="url(#screenDots)"
          opacity={0.55}
          mask="url(#dotsMask)"
        />
      </Svg>

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.screenPaddingVertical,
            paddingBottom: insets.bottom + Spacing.screenPaddingVertical,
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
    backgroundColor: Colors.bg, // Fallback behind the SVG gradient
    overflow: 'visible',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
  },
  // Top-right-only gradient area.
  // This is intentionally "wide and short" so the effect resembles the screenshot.
  topRightSvg: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: '90%',
    bottom: -80,
  },
});
