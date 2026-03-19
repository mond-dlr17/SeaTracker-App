/**
 * Port OS design system – spacing, radii, typography scale.
 * Use with Colors for consistent layouts.
 */
export const Spacing = {
  /** Screen horizontal padding (20–24px) */
  screenPaddingHorizontal: 22,
  /** Screen vertical padding for scroll content */
  screenPaddingVertical: 24,
  /** Padding inside cards */
  cardPadding: 16,
  /** Space between major sections */
  sectionGap: 28,
  /** Space between list items or related blocks */
  itemGap: 12,
  /** Tight spacing between label and input */
  fieldGap: 8,
  /** Small gap between inline elements */
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  /** Cards, modals */
  card: 18,
  /** Buttons, inputs */
  button: 10,
  /** Pills, badges */
  pill: 999,
} as const;

export const Typography = {
  /** Section labels, small caps */
  labelSize: 12,
  labelWeight: '700' as const,
  /** Body / secondary text */
  bodySize: 14,
  bodyWeight: '600' as const,
  /** Card titles, list titles */
  titleSize: 16,
  titleWeight: '800' as const,
  /** Screen headings */
  headingSize: 22,
  headingWeight: '900' as const,
  /** Large hero heading */
  heroSize: 24,
  heroWeight: '900' as const,
} as const;
