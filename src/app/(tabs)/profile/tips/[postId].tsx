import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Screen } from '../../../../shared/components/Screen';
import { Card } from '../../../../shared/components/Card';
import { Colors } from '../../../../shared/utils/colors';
import { Spacing, Typography } from '../../../../shared/utils/theme';
import { usePost } from '../../../../features/posts/postsHooks';

export default function TipDetailRoute() {
  const params = useLocalSearchParams<{ postId: string }>();
  const postId = params.postId ?? '';
  const q = usePost(postId);
  const post = q.data ?? null;

  return (
    <Screen>
      {q.isLoading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : !post ? (
        <Text style={styles.muted}>Post not found.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
          <Card style={{ gap: Spacing.itemGap }}>
            <Text style={styles.title}>{post.title}</Text>
            {post.subtitle ? <Text style={styles.subtitle}>{post.subtitle}</Text> : null}
            <Text style={styles.body}>{post.body}</Text>
          </Card>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: Typography.headingSize, fontWeight: Typography.heroWeight },
  subtitle: { color: Colors.muted, fontWeight: '700', lineHeight: 20 },
  body: { color: Colors.text, fontWeight: '600', lineHeight: 22, marginTop: Spacing.xs },
  muted: { color: Colors.muted, fontWeight: '700' },
});

