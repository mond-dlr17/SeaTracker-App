import { useState } from 'react';
import { Alert, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useMutation } from '@tanstack/react-query';

import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useCertificates } from '../../../features/certificates/certificatesHooks';
import { aiAdvisor } from '../../../features/ai/aiService';

export default function AIAdvisorRoute() {
  const { user, profile } = useAuth();
  const uid = user?.uid ?? '';
  const certsQuery = useCertificates(uid);
  const [suggestions, setSuggestions] = useState<string>('');
  const aiMut = useMutation({
    mutationFn: () => aiAdvisor({ profile: profile!, certificates: certsQuery.data ?? [] }),
    onSuccess: (data) => setSuggestions(data.suggestions ?? ''),
    onError: () => Alert.alert('AI request failed', 'Check your API base URL and try again.'),
  });

  if (!uid || !profile) return null;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.overline}>AI MARINE ADVISOR</Text>
        <Text style={styles.title}>Career Coach</Text>
        <Text style={styles.meta}>
          Ask SeaTrack what to focus on next based on your profile and certificate expiry dates.
        </Text>
      </View>

      <Card style={styles.card}>
        <Button
          title="What should I do next?"
          loading={aiMut.isPending}
          onPress={async () => {
            aiMut.mutate();
          }}
        />
      </Card>

      {suggestions ? (
      <Card style={[styles.card, styles.suggestionsCard as ViewStyle]}>
          <Text style={styles.sectionLabel}>Suggestions</Text>
          <Text style={styles.suggestions}>{suggestions}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.sectionGap,
    gap: Spacing.sm,
  },
  overline: {
    color: Colors.muted,
    fontSize: Typography.labelSize,
    fontWeight: Typography.labelWeight,
    letterSpacing: 1,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.headingSize,
    fontWeight: Typography.heroWeight,
  },
  meta: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: Typography.bodyWeight,
    lineHeight: 20,
  },
  card: {
    marginBottom: Spacing.itemGap,
  },
  suggestionsCard: {
    gap: Spacing.md,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: Typography.titleSize,
    fontWeight: Typography.titleWeight,
  },
  suggestions: {
    color: Colors.text,
    fontWeight: Typography.bodyWeight,
    lineHeight: 22,
    fontSize: Typography.bodySize,
  },
});
