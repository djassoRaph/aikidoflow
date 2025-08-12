// Create a new React Native screen in TypeScript named `HistoryScreen`.
// This screen will fetch and display all Aikido training logs from the async db helpers.
// Logs include: techniqueName, notes, teacher, partner, source (manual/voice), date (ISO format).

// UI:
// - Use FlatList to render logs
// - Each item should be shown in a Card-like View with padding and shadow
// - Show techniqueName as the title, then teacher and partner (if present), then notes
// - Format date as YYYY-MM-DD and align to top right
// - If no logs exist, show centered message: "Aucun log enregistré"
// - Add a RefreshControl (pull to refresh)

// Call `getLogs()` from `src/db.ts`, which returns logs as an array of objects

// Keep the screen visually consistent with LogScreen styling

// Export the screen as default from the file.

import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getLogs, LogRow } from '../src/db';

export default function HistoryScreen() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchLogs = useCallback(async () => {
    try {
      const data = await getLogs();
      setLogs(data);
    } catch (e) {
      setLogs([]);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: LogRow }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.technique}>{item.technique_name}</Text>
        <Text style={styles.date}>{item.date ? item.date.slice(0, 10) : ''}</Text>
      </View>
      <Text style={styles.teacher}>👤 {item.teacher}{item.partner ? ' & ' + item.partner : ''}</Text>
      <Text style={styles.notes}>{item.notes}</Text>
      <Text style={styles.source}>{item.source === 'voice' ? '🎤' : '⌨️'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item, idx) => (item.id ? String(item.id) : String(idx))}
        renderItem={renderItem}
        contentContainerStyle={logs.length === 0 && { flex: 1 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Aucun log enregistré</Text></View>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  technique: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  teacher: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  notes: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  source: {
    fontSize: 16,
    alignSelf: 'flex-end',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#aaa',
  },
  switchBtn: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  switchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
