import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';
import { useTrainings } from '../../../features/trainings/trainingsHooks';

export default function TrainingListRoute() {
  const [courseType, setCourseType] = useState<string | undefined>(undefined);
  const q = useTrainings(courseType);
  const data = q.data ?? [];

  const chips = useMemo(
    () => [
      { label: 'All Courses', value: undefined },
      { label: 'Safety', value: 'Safety' },
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Bridge', value: 'Bridge' },
    ],
    [],
  );

  return (
    <Screen>
      <View style={styles.topStack}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.overline}>Maritime Knowledge</Text>
            <Text style={styles.headerTitle}>Training Hub</Text>
          </View>
          <Pressable
            onPress={() => {
              // UI-only placeholder (no search screen wired yet).
            }}
            style={styles.searchBtn}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Ionicons name="search" size={22} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {chips.map((c) => {
            const isActive = (c.value ?? null) === (courseType ?? null);
            return (
              <Pressable
                key={c.label}
                onPress={() => setCourseType(c.value)}
                style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Recommended */}
        <View style={styles.recommendedHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Based on Expiring Docs</Text>
          </View>
        </View>

        <View style={styles.recommendedCard}>
          {/* Ambient gradient (svg) */}
          <Svg pointerEvents="none" style={styles.recommendedAmbientSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            <Defs>
              <RadialGradient id="recAmbientRight" cx="92%" cy="0%" r="70%">
                <Stop offset="0%" stopColor={Colors.accent} stopOpacity={0.28} />
                <Stop offset="35%" stopColor={Colors.accent} stopOpacity={0.14} />
                <Stop offset="70%" stopColor={Colors.accent} stopOpacity={0.06} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill="url(#recAmbientRight)" />
          </Svg>

          <View style={styles.recommendedInner}>
            <View style={styles.recommendedTopRightIcon}>
              <Text style={styles.recommendedIcon}>🎓</Text>
            </View>

            <Text style={styles.recommendedOverline}>Priority Renewal</Text>
            <Text style={styles.recommendedTitle}>STCW Revalidation</Text>
            <Text style={styles.recommendedSubtitle} numberOfLines={2}>
              Required to renew your expiring Master Mariner certificate.
            </Text>

            <View style={styles.recommendedStats}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>5 Days</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Credits</Text>
                <Text style={styles.statValue}>40 hrs</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        style={styles.flatList}
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const category = item.courseType?.trim() ? item.courseType.trim() : 'Course';
          return (
            <Card style={styles.itemCard}>
              <View style={styles.itemTopRow}>
                <Image
                  source={{ uri: `https://picsum.photos/seed/${encodeURIComponent(category)}/160/160` }}
                  style={styles.itemImage}
                />

                <View style={styles.itemInfo}>
                  <View style={styles.itemMetaTopRow}>
                    <Text style={styles.itemCategory}>{category}</Text>
                    <Text style={styles.itemProvider} numberOfLines={1}>
                      {item.provider}
                    </Text>
                  </View>

                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <View style={styles.itemLocationRow}>
                    <Text style={styles.itemLocationIcon}>⌁</Text>
                    <Text style={styles.itemLocationText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.itemBtn, pressed ? { opacity: 0.9 } : null]}
                accessibilityRole="button"
                accessibilityLabel="View Details"
                onPress={() => {
                  // Details route not implemented yet; keep UI interaction for now.
                }}
              >
                <Text style={styles.itemBtnText}>View Details</Text>
                <Text style={styles.itemBtnIcon}>›</Text>
              </Pressable>
            </Card>
          );
        }}
        ListEmptyComponent={
          q.isLoading ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : q.isError ? (
            <Text style={styles.muted}>Couldn't load trainings.</Text>
          ) : (
            <Card>
              <Text style={styles.emptyTitle}>No trainings found</Text>
              <Text style={styles.meta}>Add documents to the `trainings` collection in Firestore.</Text>
            </Card>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topStack: {
    gap: Spacing.sectionGap,
    marginBottom: Spacing.sectionGap,
  },
  flatList: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overline: {
    color: 'rgba(58,134,255,0.95)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },

  chipsRow: {
    gap: Spacing.itemGap,
    paddingVertical: 6,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipInactive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  chipTextActive: {
    color: Colors.white,
  },
  chipTextInactive: {
    color: Colors.muted,
  },

  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: Typography.titleSize,
    fontWeight: Typography.titleWeight,
  },
  badge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: Colors.yellow,
    fontWeight: '800',
    fontSize: 11,
  },

  recommendedCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  recommendedAmbientSvg: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 220,
    height: 220,
  },
  recommendedInner: {
    gap: 10,
  },
  recommendedTopRightIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  recommendedIcon: {
    fontSize: 54,
    opacity: 0.22,
  },
  recommendedOverline: {
    color: 'rgba(255,255,255,0.60)',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  recommendedTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  recommendedSubtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 14,
    lineHeight: 20,
  },
  recommendedStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  statCol: {
    flexDirection: 'column',
    gap: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.60)',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },

  listContent: {
    gap: Spacing.itemGap,
    paddingBottom: Spacing.xxl + 56,
  },

  itemCard: {
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.8)',
    padding: Spacing.cardPadding,
    gap: Spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.surface2,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemMetaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemCategory: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    maxWidth: '60%',
  },
  itemProvider: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '900',
    maxWidth: '40%',
    textAlign: 'right',
  },
  itemTitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  itemLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  itemLocationIcon: {
    color: Colors.muted,
    fontSize: 12,
  },
  itemLocationText: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },

  itemBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  itemBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  itemBtnIcon: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: -1,
  },

  emptyTitle: {
    color: Colors.primary,
    fontSize: Typography.titleSize,
    fontWeight: Typography.titleWeight,
    marginBottom: 6,
  },
  meta: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: Typography.bodyWeight,
  },
  muted: {
    color: Colors.muted,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
});
