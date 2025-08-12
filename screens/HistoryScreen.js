import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchTechniques, deleteTechnique } from '../db/techniques';

const HistoryScreen = () => {
  const [techniques, setTechniques] = useState([]);

  useEffect(() => {
    const loadTechniques = () => {
      fetchTechniques(
        (data) => setTechniques(data),
        (error) => console.error(error)
      );
    };

    loadTechniques();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => console.log('Open detail modal')}>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString('fr-FR')}</Text>
      <Text style={styles.technique}>{item.technique || item.note.substring(0, 40)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={techniques}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  technique: {
    fontSize: 16,
  },
});

export default HistoryScreen; 