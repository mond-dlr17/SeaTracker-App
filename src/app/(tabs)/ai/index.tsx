import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Colors } from '../../../shared/utils/colors';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useCertificates } from '../../../features/certificates/certificatesHooks';
import { aiAdvisor } from '../../../features/ai/aiService';

export default function AIAdvisorRoute() {
  const { user, profile } = useAuth();
  const uid = user?.uid ?? '';
  const certsQuery = useCertificates(uid);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string>('');

  if (!uid || !profile) return null;

  return (
    <Screen>
      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>AI Advisor</Text>
        <Text style={styles.meta}>
          Ask SeaTrack what to focus on next based on your profile and certificate expiry dates.
        </Text>
        <Button
          title="What should I do next?"
          loading={loading}
          onPress={async () => {
            try {
              setLoading(true);
              const data = await aiAdvisor({ profile, certificates: certsQuery.data ?? [] });
              setSuggestions(data.suggestions ?? '');
            } catch {
              Alert.alert('AI request failed', 'Check your API base URL and try again.');
            } finally {
              setLoading(false);
            }
          }}
        />
      </Card>

      {suggestions ? (
        <>
          <Text style={{ height: 12 }} />
          <Card style={{ gap: 8 }}>
            <Text style={styles.title}>Suggestions</Text>
            <Text style={styles.suggestions}>{suggestions}</Text>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 18, fontWeight: '900' },
  meta: { color: Colors.muted, fontWeight: '700' },
  suggestions: { color: Colors.text, fontWeight: '600', lineHeight: 20 },
});

