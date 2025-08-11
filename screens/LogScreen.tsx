// Build a complete React Native screen in TypeScript called LogScreen for an Aikido training log app.
// The screen should:
// ✅ Use React Native + Expo components
// ✅ Support both manual and voice-to-text input
// ✅ Save entries into the async db module
// ✅ Include debugging console logs for easy testing
// ✅ Work fully offline, no backend

// ---- UI DESIGN ----
// Create a form with the following fields:
// - technique_name (TextInput) + 🎤 mic button for voice input 
// - notes (multiline TextInput) + 🎤 mic button for voice input
// - teacher (TextInput)
// - partner (optional, TextInput)
// - Submit button labeled "Log Technique"

// Show state feedback like:
// - Listening… when voice recognition is active
// - "✅ Log saved" confirmation after submit
// - Error messages if mic fails or insertLog fails

// ---- FUNCTIONALITY ----
// Use @react-native-community/voice for speech-to-text // import Voice from '@react-native-community/voice'; ?
// - Import and initialize Voice
// - Support French/Japanese/English pronunciation
// - When mic is pressed, start recognition for 5–10s and insert result into technique_name or notes field
// - Use state to manage which field is currently recording

// On submit:
// - Call insertLog() from db with:
//   { technique_name, notes, teacher, partner, date: new Date().toISOString(), source: "voice" or "manual" }
// - Reset form
// - Show confirmation

// Add cleanup on component unmount to stop voice listeners
// Include console logs for:
// - Voice start/stop
// - Errors
// - InsertLog success/failure

// Assume db helpers are already implemented and available via:
import { insertLog } from '../src/db';




// After submission, reset the form and show a small "✅ Sauvgarde effectuée" message.
// Handle voice recognition errors, show "Listening..." feedback, and stop recognition properly on unmount.

// Add a debug part for now as well. 
//Voice.onSpeechResults = (e) => {
//    console.log("Speech results:", e.value);
// };



// Add a "Voir l'historique" button below the form
// When tapped, navigate to "HistoryScreen" using react-navigation

// Ensure you use useNavigation() hook from @react-navigation/native


import React, { useEffect, useRef, useState } from 'react';
import { Button, Keyboard, Platform, StyleSheet, TextInput, TouchableOpacity, View, Text, Animated } from 'react-native';
import Voice from '@react-native-community/voice';
import { useNavigation } from '@react-navigation/native';

// Placeholder for IconSymbol
const IconSymbol = ({ name, color, size }: { name: string; color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🎤</Text>
);

// Replace Colors.light.tint and Colors.light.background with hardcoded values
const COLORS = {
  tint: '#007AFF', // iOS blue
  background: '#fff',
};

const initialState = {
  technique_name: '',
  notes: '',
  teacher: '',
  partner: '',
};

type Field = 'technique_name' | 'notes' | null;

export default function LogScreen() {
  const [form, setForm] = useState(initialState);
  const [listening, setListening] = useState<Field>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [source, setSource] = useState<'manual' | 'voice'>('manual');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    Voice.onSpeechStart = () => {
      console.log('Voice recognition started');
      setFeedback('🎤 Listening...');
    };
    Voice.onSpeechEnd = () => {
      console.log('Voice recognition ended');
      setFeedback('');
      setListening(null);
    };
    Voice.onSpeechResults = (e) => {
      console.log('Speech results:', e.value);
      if (listening && e.value && e.value[0]) {
        setForm(prev => ({ ...prev, [listening]: e.value[0] }));
        setSource('voice');
      }
      setListening(null);
      setFeedback('');
    };
    Voice.onSpeechError = (e) => {
      console.log('Voice error:', e.error);
      setError('Erreur micro: ' + (e.error?.message || ''));
      setListening(null);
      setFeedback('');
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [listening]);

  const startVoice = async (field: Field) => {
    try {
      setListening(field);
      setFeedback('🎤 Listening...');
      setError('');
      Animated.spring(scaleAnim, { toValue: 1.4, useNativeDriver: true }).start();
      await Voice.start(Platform.OS === 'ios' ? 'fr-FR' : 'fr-FR');
    } catch (e: any) {
      setError('Erreur micro: ' + (e.message || ''));
      setListening(null);
      setFeedback('');
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  const stopVoice = async () => {
    try {
      await Voice.stop();
    } finally {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  const handleChange = (field: keyof typeof initialState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSource('manual');
  };

  const handleSubmit = async () => {
    setError('');
    setFeedback('');
    Keyboard.dismiss();
    try {
      await insertLog({
        ...form,
        date: new Date().toISOString(),
        source,
      });
      setForm(initialState);
      setFeedback('✅ Sauvegarde effectuée');
      setTimeout(() => setFeedback(''), 2000);
      console.log('Log saved');
    } catch (e: any) {
      setError('Erreur sauvegarde: ' + (e.message || ''));
      console.log('InsertLog error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aikido Log</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.input}
          placeholder="Technique"
          value={form.technique_name}
          onChangeText={v => handleChange('technique_name', v)}
        />
        <Animated.View style={{ transform: [{ scale: listening === 'technique_name' ? scaleAnim : 1 }] }}>
          <TouchableOpacity
            onPressIn={() => startVoice('technique_name')}
            onPressOut={stopVoice}
            style={styles.micBtn}
          >
            <IconSymbol name="paperplane.fill" color={COLORS.tint} size={28} />
          </TouchableOpacity>
        </Animated.View>
      </View>
      <View style={styles.fieldRow}>
        <TextInput
          style={[styles.input, styles.notes]}
          placeholder="Notes"
          value={form.notes}
          onChangeText={v => handleChange('notes', v)}
          multiline
        />
        <Animated.View style={{ transform: [{ scale: listening === 'notes' ? scaleAnim : 1 }] }}>
          <TouchableOpacity
            onPressIn={() => startVoice('notes')}
            onPressOut={stopVoice}
            style={styles.micBtn}
          >
            <IconSymbol name="paperplane.fill" color={COLORS.tint} size={28} />
          </TouchableOpacity>
        </Animated.View>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Teacher"
        value={form.teacher}
        onChangeText={v => handleChange('teacher', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Partner (optionnel)"
        value={form.partner}
        onChangeText={v => handleChange('partner', v)}
      />
      <Button title="Log Technique" onPress={handleSubmit} />
      <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('HistoryScreen')}>
        <Text style={styles.switchBtnText}>📄 Historique</Text>
      </TouchableOpacity>
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  notes: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  micBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedback: {
    color: COLORS.tint,
    marginTop: 10,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  switchBtn: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
