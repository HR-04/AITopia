import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';



export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const speechSynthesis = window.speechSynthesis;
    
    if (!speechSynthesis) {
      setIsBrowserSupported(false);
      setError('Speech synthesis is not supported in this browser.');
      return;
    }
    
    setIsBrowserSupported(true);
    
    const handleSpeakEnd = () => {
      setIsSpeaking(false);
    };
    
    // Add event listener to detect when speaking ends
    speechSynthesis.addEventListener('end', handleSpeakEnd);
    
    return () => {
      speechSynthesis.removeEventListener('end', handleSpeakEnd);
      speechSynthesis.cancel();
    };
  }, []);

  const getVoiceForLanguage = useCallback((lang) => {
    const voices = window.speechSynthesis.getVoices();
    const langCode = lang.slice(0, 2).toLowerCase();
    
    // Try to find a voice that matches the language
    const voice = voices.find(v => v.lang.toLowerCase().startsWith(langCode));
    
    // Fall back to a default voice if no match
    return voice || voices[0];
  }, []);

  const speak = useCallback((text) => {
    if (!isBrowserSupported) return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const currentLang = i18n.language || 'en';
      utterance.voice = getVoiceForLanguage(currentLang);
      utterance.lang = currentLang;
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
      setError(null);
    } catch (err) {
      console.error('Error with speech synthesis:', err);
      setError('Failed to synthesize speech');
    }
  }, [i18n.language, isBrowserSupported, getVoiceForLanguage]);

  const cancel = useCallback(() => {
    if (!isBrowserSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isBrowserSupported]);

  return {
    speak,
    cancel,
    isSpeaking,
    isPaused,
    isBrowserSupported,
    error
  };
}
