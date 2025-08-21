'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = useCallback((text: string, lang: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        toast({
            variant: 'destructive',
            title: 'Text-to-Speech not supported',
            description: 'Your browser does not support this feature.',
        });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.lang === lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else if (lang !== 'en') {
        const fallbackVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (fallbackVoice) {
            utterance.voice = fallbackVoice;
            utterance.lang = 'en-US';
             toast({
                title: 'Language not available',
                description: `Voice for the selected language not found. Falling back to English.`,
            });
        }
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis Error:', event.error);
      setIsSpeaking(false);
      toast({
        variant: 'destructive',
        title: 'Playback Error',
        description: 'Could not play the audio.',
      });
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, toast]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };

    // Ensure voices are loaded
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.speechSynthesis.cancel();
    };
  }, [isSpeaking]);

  return { isSpeaking, speak };
}
