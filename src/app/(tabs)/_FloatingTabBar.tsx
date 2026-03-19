import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../shared/utils/colors';

const BAR_HEIGHT = 72;
const FAB_SIZE = 56;
const FAB_ICON_SIZE = 26;
const H_INSET = 24;
const PILL_RADIUS = 24;
const CENTER_TAB = 'ai';
/** Half of FAB sits above the pill top edge (matches reference -top-6 feel). */
const FAB_LIFT = FAB_SIZE / 2;
const ICON_BOX = 26;
const TAB_GAP = 3;

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const tabBarStyle = focusedRoute
    ? (descriptors[focusedRoute.key]?.options.tabBarStyle as { display?: string } | undefined)
    : undefined;
  if (tabBarStyle?.display === 'none') {
    return null;
  }

  const bottomPad = insets.bottom + 16;
  const activeTint = Colors.white;
  const inactiveTint = Colors.muted;

  return (
    <View style={[styles.outer, { paddingBottom: bottomPad, paddingHorizontal: H_INSET }]}>
      <View style={styles.pillRow}>
        <View style={styles.pill}>
          {state.routes.map((route) => {
            if (route.name === CENTER_TAB) {
              return <View key={route.key} style={styles.centerSlot} />;
            }

            const { options } = descriptors[route.key];
            const routeIndex = state.routes.findIndex((r) => r.key === route.key);
            const isFocused = state.index === routeIndex;
            const color = isFocused ? activeTint : inactiveTint;

            const rawLabel =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;
            const label = typeof rawLabel === 'string' ? rawLabel : route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params as object | undefined);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabSlot}
              >
                <View style={styles.iconBox}>
                  {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
                </View>
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: focusedRoute?.name === CENTER_TAB }}
          accessibilityLabel="Assistant"
          onPress={() => {
            const route = state.routes.find((r) => r.name === CENTER_TAB);
            if (!route) return;
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.name, route.params as object | undefined);
            }
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              transform: [{ translateX: -FAB_SIZE / 2 }, { scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Ionicons name="sparkles" size={FAB_ICON_SIZE} color={Colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  pillRow: {
    marginTop: FAB_LIFT,
    height: BAR_HEIGHT,
    position: 'relative',
    overflow: 'visible',
    width: '100%',
  },
  pill: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    borderRadius: PILL_RADIUS,
    backgroundColor: Colors.primary,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
      },
      android: { elevation: 14 },
    }),
  },
  /** Equal width to the three pressable tabs — keeps FAB centered on the bar midpoint. */
  centerSlot: {
    flex: 1,
    minWidth: 0,
  },
  tabSlot: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: TAB_GAP,
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
    maxWidth: '100%',
  },
  fab: {
    position: 'absolute',
    left: '50%',
    top: -FAB_LIFT,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.bg,
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
});
