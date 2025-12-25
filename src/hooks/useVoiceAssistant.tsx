import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceSettings {
  language: string;
  gender: 'male' | 'female';
  rate: number;
  pitch: number;
}

const LANGUAGE_VOICES: Record<string, { male: string; female: string }> = {
  'en-US': { male: 'en-US', female: 'en-US' },
  'en-GB': { male: 'en-GB', female: 'en-GB' },
  'es-ES': { male: 'es-ES', female: 'es-ES' },
  'fr-FR': { male: 'fr-FR', female: 'fr-FR' },
  'de-DE': { male: 'de-DE', female: 'de-DE' },
  'it-IT': { male: 'it-IT', female: 'it-IT' },
  'pt-BR': { male: 'pt-BR', female: 'pt-BR' },
  'ja-JP': { male: 'ja-JP', female: 'ja-JP' },
  'zh-CN': { male: 'zh-CN', female: 'zh-CN' },
  'hi-IN': { male: 'hi-IN', female: 'hi-IN' },
  'ar-SA': { male: 'ar-SA', female: 'ar-SA' },
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ar-SA', name: 'Arabic' },
];

export const useVoiceAssistant = () => {
  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'en-US',
    gender: 'female',
    rate: 1,
    pitch: 1,
  });
  const [supported, setSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [listeningError, setListeningError] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeechRecognition = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      setSupported(hasSpeechRecognition);

      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
      };

      loadVoices();
      synthRef.current?.addEventListener('voiceschanged', loadVoices);

      return () => {
        synthRef.current?.removeEventListener('voiceschanged', loadVoices);
        // stop any active recognizers on unmount
        try {
          recognitionRef.current?.stop();
        } catch (e) {}
        try {
          wakeRecognitionRef.current?.stop();
        } catch (e) {}
      };
    }
  }, []);

  const getVoiceForSettings = useCallback(() => {
    const { language, gender } = settings;
    
    // Try to find a voice matching language and gender preference
    let voice = availableVoices.find(v => {
      const matchesLang = v.lang.startsWith(language.split('-')[0]);
      const matchesGender = gender === 'female' 
        ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.includes('Samantha') || v.name.includes('Victoria')
        : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man') || v.name.includes('Daniel') || v.name.includes('David');
      return matchesLang && matchesGender;
    });

    // Fallback to any voice matching the language
    if (!voice) {
      voice = availableVoices.find(v => v.lang.startsWith(language.split('-')[0]));
    }

    // Final fallback to first available voice
    return voice || availableVoices[0];
  }, [settings, availableVoices]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoiceForSettings();
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = settings.language;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [settings, getVoiceForSettings]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback((onResult?: (text: string) => void) => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported');
      setSupported(false);
      return;
    }

    // use a dedicated recognizer for active listening
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = settings.language;

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      
      if (finalTranscript && onResult) {
        onResult(finalTranscript);
      }
    };

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => {
      setIsListening(false);
      setListeningError('');
    };
    recognitionRef.current.onerror = (event: any) => {
      const err = event.error || 'unknown error';
      console.error('SpeechRecognition error:', err);
      setListeningError(err);
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      // ignore if already started
    }
  }, [settings.language]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startWakeWordDetection = useCallback((onWakeWord: () => void) => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported');
      setSupported(false);
      return;
    }

    // use a separate recognizer for wake-word detection so it doesn't conflict
    wakeRecognitionRef.current = new SpeechRecognitionAPI();
    wakeRecognitionRef.current.continuous = true;
    wakeRecognitionRef.current.interimResults = true;
    wakeRecognitionRef.current.lang = settings.language;

    wakeRecognitionRef.current.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (transcript.includes('hey knight guide') || transcript.includes('hey night guide')) {
          onWakeWord();
          break;
        }
      }
    };

    wakeRecognitionRef.current.onstart = () => setWakeWordActive(true);
    wakeRecognitionRef.current.onend = () => {
      // Restart if still active
      if (wakeWordActive && wakeRecognitionRef.current) {
        try {
          wakeRecognitionRef.current.start();
        } catch (e) {}
      }
    };

    try {
      wakeRecognitionRef.current.start();
    } catch (e) {}
  }, [settings.language, wakeWordActive]);

  const stopWakeWordDetection = useCallback(() => {
    setWakeWordActive(false);
    wakeRecognitionRef.current?.stop();
  }, []);

  return {
    settings,
    setSettings,
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    transcript,
    setTranscript,
    startWakeWordDetection,
    stopWakeWordDetection,
    wakeWordActive,
    availableVoices,
    supported,
    listeningError,
    setListeningError,
  };
};
