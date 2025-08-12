import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { insertTechnique } from '../db/techniques';
import useSpeech from '../utils/useSpeech';
import DateTimePicker from '@react-native-community/datetimepicker';
import techniques from '../data/techniques.json';
import RNPickerSelect from 'react-native-picker-select';
import { Provider as PaperProvider } from 'react-native-paper';

const LogScreen = () => {
  const { isListening, transcript, startListening, stopListening } = useSpeech();
  const [technique, setTechnique] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState(null);

  const handleSave = async () => {
    await insertTechnique({
      technique: selected ?? '',
      note,
      date: new Date().toISOString()
    });
    setSelected(null);
    setNote('');
  };

  return (
    <View style={styles.container}>
      <PaperProvider>
        <RNPickerSelect
          onValueChange={setSelected}
          items={techniques.map(t => ({ label: t.label, value: t.label }))}
          placeholder={{ label: 'Choisir une technique…', value: null }}
        />
        <TextInput
          label="Note"
          value={note}
          onChangeText={setNote}
          multiline
        />
        <Button mode="contained" onPress={handleSave} disabled={!selected && !note}>
          Enregistrer
        </Button>
      </PaperProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LogScreen; 