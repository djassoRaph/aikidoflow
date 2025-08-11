import { useState, useEffect } from 'react';
import Voice from '@react-native-community/voice';

const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (event) => {
      setTranscript(event.value[0]);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = () => {
    Voice.start('fr-FR');
  };

  const stopListening = () => {
    Voice.stop();
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};

export default useSpeech; 