import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../../shared/components/Screen';
import { Card } from '../../../shared/components/Card';
import { TextField } from '../../../shared/components/TextField';
import { Colors } from '../../../shared/utils/colors';
import { useTrainings } from '../../../features/trainings/trainingsHooks';

export default function TrainingListRoute() {
  const [courseType, setCourseType] = useState('');
  const q = useTrainings(courseType.trim() ? courseType.trim() : undefined);
  const data = q.data ?? [];

  return (
    <Screen>
      <View style={{ gap: 12, marginBottom: 12 }}>
        <Text style={styles.title}>Training listings</Text>
        <TextField label="Filter by courseType" value={courseType} onChangeText={setCourseType} placeholder="e.g. STCW" />
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card style={{ gap: 6 }}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.provider} · {item.location}
            </Text>
            {item.courseType ? <Text style={styles.meta}>Type: {item.courseType}</Text> : null}
          </Card>
        )}
        ListEmptyComponent={
          q.isLoading ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : q.isError ? (
            <Text style={styles.muted}>Couldn’t load trainings.</Text>
          ) : (
            <Card>
              <Text style={styles.itemTitle}>No trainings found</Text>
              <Text style={styles.meta}>Add documents to the `trainings` collection in Firestore.</Text>
            </Card>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 22, fontWeight: '900' },
  itemTitle: { color: Colors.text, fontSize: 16, fontWeight: '900' },
  meta: { color: Colors.muted, fontWeight: '700' },
  muted: { color: Colors.muted, fontWeight: '700' },
});

