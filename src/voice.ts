let Voice: any;
export const voiceAvailable = (() => {
  try {
    // Works when you build a Dev Client
    Voice = require('@react-native-voice/voice').default ?? require('@react-native-voice/voice');
    return true;
  } catch {
    // Expo Go fallback (no-op)
    Voice = {
      onSpeechStart: undefined,
      onSpeechEnd: undefined,
      onSpeechResults: undefined,
      onSpeechError: undefined,
      start: async () => console.warn('Voice is unavailable in Expo Go.'),
      stop: async () => {},
      destroy: async () => {},
      removeAllListeners: () => {},
    };
    return false;
  }
})();
export default Voice;
