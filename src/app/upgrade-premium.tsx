import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '../shared/utils/colors';
import { Radius, Spacing, Typography } from '../shared/utils/theme';

type BillingInterval = 'monthly' | 'annually';

function PremiumRowIcon({ label }: { label: string }) {
  return (
    <View style={styles.featureIcon}>
      <Text style={styles.featureIconText}>{label}</Text>
    </View>
  );
}

export default function UpgradePremiumModalRoute() {
  const insets = useSafeAreaInsets();
  const [interval, setInterval] = useState<BillingInterval>('monthly');

  const priceText = useMemo(() => {
    // UI-only placeholder for now. Add real pricing/payment logic later.
    if (interval === 'annually') return '$9.99';
    return '$12.99';
  }, [interval]);

  return (
    <View style={styles.container}>
      {/* Ambient premium depth */}
      <Svg pointerEvents="none" style={styles.ambientSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="ambientRight" cx="92%" cy="10%" r="55%">
            <Stop offset="0%" stopColor={Colors.accent} stopOpacity="0.22" />
            <Stop offset="55%" stopColor={Colors.accent} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={Colors.accent} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="ambientLeft" cx="0%" cy="35%" r="45%">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.11" />
            <Stop offset="60%" stopColor={Colors.primary} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#ambientRight)" />
        <Rect x="0" y="0" width="100" height="100" fill="url(#ambientLeft)" />
      </Svg>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>Membership</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.proPill}>
            <View style={styles.pillIconCircle}>
              <Text style={styles.pillIconText}>✓</Text>
            </View>
            <Text style={styles.pillText}>SeaTrack Pro</Text>
          </View>

          <Text style={styles.heroTitle}>
            Unlock your{'\n'}
            full potential
          </Text>
          <Text style={styles.heroSubtitle}>
            Join 15,000+ elite seafarers managing their careers with Pro tools.
          </Text>
        </View>

        <View style={styles.featureList}>
          <View style={styles.featureCard}>
            <PremiumRowIcon label="✓" />
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Unlimited Applications</Text>
              <Text style={styles.featureSubtitle}>Apply to any vessel without limits</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <PremiumRowIcon label="⚡" />
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Exclusive Listings</Text>
              <Text style={styles.featureSubtitle}>Early access to high-paying contracts</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <PremiumRowIcon label="%" />
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>15% Training Discounts</Text>
              <Text style={styles.featureSubtitle}>Save on STCW & specialty courses</Text>
            </View>
          </View>
        </View>

        {/* Billing Toggle */}
        <View style={styles.billingToggleWrap}>
          <View style={styles.billingToggle}>
            <Pressable
              onPress={() => setInterval('monthly')}
              style={({ pressed }) => [
                styles.billingOption,
                interval === 'monthly' ? styles.billingOptionActive : styles.billingOptionInactive,
                pressed && interval === 'monthly' ? { opacity: 0.9 } : null,
              ]}
            >
              <Text style={styles.billingOptionTextActive}>Monthly</Text>
            </Pressable>
            <Pressable
              onPress={() => setInterval('annually')}
              style={({ pressed }) => [
                styles.billingOption,
                interval === 'annually' ? styles.billingOptionActive : styles.billingOptionInactive,
                pressed && interval === 'annually' ? { opacity: 0.9 } : null,
              ]}
            >
              <Text style={styles.billingOptionTextInactive}>Annually (-20%)</Text>
            </Pressable>
          </View>
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          {/* Ambient gradient background behind the card content */}
          <Svg
            pointerEvents="none"
            style={styles.pricingCardAmbientSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <Defs>
              <RadialGradient id="pricingAmbientRight" cx="92%" cy="0%" r="70%">
                <Stop offset="0%" stopColor={Colors.accent} stopOpacity="0.28" />
                <Stop offset="30%" stopColor={Colors.accent} stopOpacity="0.12" />
                <Stop offset="70%" stopColor={Colors.accent} stopOpacity="0.05" />
              </RadialGradient>
             
              <Rect x="0" y="0" width="100" height="100" />
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill="url(#pricingAmbientRight)" />
          </Svg>
          <View style={styles.pricingInner}>
            <View style={styles.pricingHeader}>
              <View>
                <Text style={styles.pricingTitle}>Pro Plan</Text>
                <Text style={styles.pricingSubtitle}>Full maritime suite</Text>
              </View>
              <View style={styles.priceCol}>
                <Text style={styles.priceText}>{priceText}</Text>
                <Text style={styles.perMonthText}>per month</Text>
              </View>
            </View>

            <View style={styles.pricingDivider} />

            <View style={styles.pricingBenefits}>
              <View style={styles.benefitRow}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Advanced Sea-Time Analytics</Text>
              </View>
              <View style={styles.benefitRow}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Priority Recruiter Support</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions stack */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <View style={styles.footerSectionHeader}>
          <Text style={styles.footerOverline}>Payment Method</Text>
          <View style={styles.paymentIconsRow}>
            <View style={styles.paymentIconPlaceholder}>
              <Text style={styles.paymentIconText}>STRIPE</Text>
            </View>
            <View style={styles.paymentGcash}>
              <Text style={styles.paymentGcashText}>GCASH</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => {
            // UI-only placeholder. Replace with real checkout flow.
          }}
          style={({ pressed }) => [
            styles.upgradeBtn,
            pressed ? { opacity: 0.9 } : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Upgrade Now"
        >
          <View style={styles.upgradeBtnIcon}>
            <Text style={styles.upgradeBtnIconText}>⌁</Text>
          </View>
          <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
        </Pressable>

        <Text style={styles.footerNote}>
          Secure end-to-end encrypted processing.{'\n'}Cancel your subscription anytime.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  ambientSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  topBar: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: {
    color: 'rgba(11, 31, 58, 0.40)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: Colors.primary,
    fontSize: 26,
    fontWeight: '600',
    marginTop: -2,
  },
  backBtnPlaceholder: { width: 44, height: 44 },

  scroll: { flex: 1 },

  scrollContent: {
    paddingTop: 10,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
  },

  hero: {
    paddingTop: 28,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 22,
  },

  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(58, 134, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.22)',
    marginBottom: 16,
  },
  pillIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(58, 134, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillIconText: { color: Colors.accent, fontSize: 14, fontWeight: '900' },
  pillText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  heroTitle: {
    color: Colors.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: Typography.heroWeight,
    letterSpacing: -0.2,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: Colors.muted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  featureList: {
    gap: Spacing.itemGap,
    marginBottom: 26,
  },

  featureCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.65)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(58, 134, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '900',
  },

  featureTextCol: { flex: 1 },
  featureTitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureSubtitle: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },

  billingToggleWrap: { alignItems: 'center', marginBottom: 26 },
  billingToggle: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.9)',
  },
  billingOption: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  billingOptionActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  billingOptionInactive: {
    backgroundColor: 'transparent',
  },
  billingOptionTextActive: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  billingOptionTextInactive: {
    color: Colors.muted,
    fontWeight: '700',
    fontSize: 14,
  },

  pricingCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  pricingCardAmbientSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pricingDecorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -38,
    top: -38,
    backgroundColor: 'rgba(58, 134, 255, 0.22)',
  },
  pricingInner: { position: 'relative', zIndex: 1 },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  pricingTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '900',
    opacity: 0.92,
    marginBottom: 4,
  },
  pricingSubtitle: {
    color: Colors.white,
    opacity: 0.6,
    fontSize: 12,
    fontWeight: '700',
  },
  priceCol: { alignItems: 'flex-end' },
  priceText: { color: Colors.white, fontSize: 34, fontWeight: '900', letterSpacing: -0.4 },
  perMonthText: {
    color: Colors.white,
    opacity: 0.6,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 1,
  },
  pricingDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 8,
    marginHorizontal: 8,
  },
  pricingBenefits: { paddingHorizontal: 12, gap: 10 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitIcon: { color: Colors.accent, fontSize: 16, fontWeight: '900' },
  benefitText: { color: Colors.white, opacity: 0.92, fontSize: 14, fontWeight: '800' },

  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'rgba(245, 246, 248, 0.86)',
    paddingTop: 14,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    gap: 10,
  },

  footerSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerOverline: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  paymentIconsRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  paymentIconPlaceholder: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(58, 134, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconText: { color: Colors.accent, fontSize: 10, fontWeight: '900' },
  paymentGcash: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(58, 134, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentGcashText: { color: Colors.accent, fontSize: 10, fontWeight: '900' },

  upgradeBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  upgradeBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  upgradeBtnIconText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  upgradeBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },

  footerNote: {
    color: Colors.muted,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontWeight: '700',
  },
});

