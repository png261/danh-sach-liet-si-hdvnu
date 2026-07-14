"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useSpeechRecognition(onResult: (text: string) => void, onError?: (error: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false; // Stop listening when user stops speaking
        rec.lang = "vi-VN";     // Set language to Vietnamese
        rec.interimResults = false;

        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          onResult(resultText);
        };
        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (onError) onError(event.error);
        };

        recognitionRef.current = rec;
      }
    }
  }, [onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const isSupported = typeof window !== "undefined" && 
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

  return { isListening, startListening, stopListening, isSupported };
}
