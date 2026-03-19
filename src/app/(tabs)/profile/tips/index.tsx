import { FlatList, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '../../../../shared/components/Screen';
import { Card } from '../../../../shared/components/Card';
import { Colors } from '../../../../shared/utils/colors';
import { Spacing, Typography } from '../../../../shared/utils/theme';
import { usePosts } from '../../../../features/posts/postsHooks';

export default function TipsListRoute() {
  const q = usePosts();
  const data = q.data ?? [];

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: Spacing.itemGap, paddingBottom: Spacing.xxl }}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
            <Text style={styles.link} onPress={() => router.push(`/(tabs)/profile/tips/${item.id}`)} suppressHighlighting>
              Read
            </Text>
          </Card>
        )}
        ListEmptyComponent={
          q.isLoading ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : q.isError ? (
            <Text style={styles.muted}>Couldn’t load posts.</Text>
          ) : (
            <Card>
              <Text style={styles.title}>No posts yet</Text>
              <Text style={styles.subtitle}>Add documents to the `posts` collection in Firestore.</Text>
            </Card>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: Typography.titleSize, fontWeight: Typography.titleWeight },
  subtitle: { color: Colors.muted, fontWeight: '700', marginTop: Spacing.xs, lineHeight: 18 },
  link: { color: Colors.accent, fontWeight: '700', marginTop: Spacing.sm },
  muted: { color: Colors.muted, fontWeight: '700' },
});

