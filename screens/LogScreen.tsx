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


import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Button, Keyboard, NativeModules, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Voice, { voiceAvailable } from '../src/voice'; // ✅ relative path
console.log('voiceAvailable =', voiceAvailable);
console.log('NativeModules.Voice =', NativeModules.Voice);


// Placeholder for IconSymbol
const IconSymbol = ({ name, color, size }: { name: string; color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🎤</Text>
);

// Replace Colors.light.tint and Colors.light.background with hardcoded values
const COLORS = {
  tint: '#007AFF', // iOS blue
  background: '#fff',
};

const initialState : LogForm = {
  technique_name: '',
  notes: '',
  teacher: '',
  partner: '',
};

type Field = 'technique_name' | 'notes' | null;
type LogForm = {
  technique_name: string;
  notes?: string;
  teacher?: string;
  partner?: string; // keep if your UI uses this key
};

export default function LogScreen() {
  const [form, setForm] = useState<LogForm>(initialState);
  const [listening, setListening] = useState<Field>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [source, setSource] = useState<'manual' | 'voice'>('manual');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<any>();
  const listeningRef = useRef<Field>(null);
  useEffect(() => { listeningRef.current = listening; }, [listening]);
  useEffect(() => {
  if (!voiceAvailable) return;

  Voice.onSpeechStart = () => {
    console.log('onSpeechStart');
    setFeedback('🎤 Listening...');
  };

  Voice.onSpeechPartialResults = (e: any) => {
    console.log('onSpeechPartialResults:', e?.value);
    const field = listeningRef.current;
    if (field && e?.value?.[0]) {
      setForm(prev => ({ ...prev, [field]: e.value[0] })); // live preview
      setSource('voice');
    }
  };

  Voice.onSpeechResults = (e: any) => {
    console.log('onSpeechResults:', e?.value);
    const field = listeningRef.current;
    if (field && e?.value?.[0]) {
      setForm(prev => ({ ...prev, [field]: e.value[0] })); // final text
      setSource('voice');
    }
    setListening(null);
    setFeedback('');
  };

  Voice.onSpeechEnd = () => {
    console.log('onSpeechEnd');
    setFeedback('');
    setListening(null);
  };

  Voice.onSpeechError = (e: any) => {
    console.log('onSpeechError:', e?.error);
    setError('Erreur micro: ' + (e?.error?.message || ''));
    setListening(null);
    setFeedback('');
  };

  return () => {
    // cleanup once when screen unmounts
    Voice.destroy().then(Voice.removeAllListeners);
    if (timerRef.current) clearTimeout(timerRef.current as any);
  };
}, [voiceAvailable]); // <— important: separate effect, runs once when voice is available

  const startVoice = async (field: Field) => {
    if (!voiceAvailable) { setError('Voice not available in Expo Go'); return; }
    try {
      setListening(field);
      setFeedback('🎤 Listening...');
      setError('');
      Animated.spring(scaleAnim, { toValue: 1.4, useNativeDriver: true }).start();
  
      console.log('CALL Voice.start fr-FR');
      await Voice.start('fr-FR', { EXTRA_PARTIAL_RESULTS: true } as any);
  
      // auto-stop after 2.5s in case user forgets to release
      if (timerRef.current) clearTimeout(timerRef.current as any);
      timerRef.current = setTimeout(() => {
        console.log('CALL Voice.stop (auto)');
        Voice.stop();
      }, 2500) as any;
    } catch (e: any) {
      setError('Erreur micro: ' + (e?.message || ''));
      setListening(null);
      setFeedback('');
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  };
  


const stopVoice = async () => {
  if (!voiceAvailable) return;
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
        date: new Date().toISOString(),
        technique: form.technique_name ?? '',           // required
        notes: form.notes ?? undefined,                  // optional
        teacher: form.teacher ?? undefined,              // optional
        source: source ?? undefined,           // avoid null
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
      <Button title="Save Technique" onPress={handleSubmit} />
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );}

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
