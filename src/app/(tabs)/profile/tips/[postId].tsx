import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Screen } from '../../../../shared/components/Screen';
import { Card } from '../../../../shared/components/Card';
import { Colors } from '../../../../shared/utils/colors';
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
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Card style={{ gap: 10 }}>
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
  title: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  subtitle: { color: Colors.muted, fontWeight: '700', lineHeight: 20 },
  body: { color: Colors.text, fontWeight: '600', lineHeight: 22, marginTop: 6 },
  muted: { color: Colors.muted, fontWeight: '700' },
});

