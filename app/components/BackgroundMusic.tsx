"use client";

import { useEffect } from "react";
import useSound from "use-sound";
import type { Howl } from "howler";

// Expose the underlying Howl instance on window so useMartyrTTS
// can call .fade() to duck the music during TTS playback.
declare global {
  interface Window { bgMusic?: Howl; }
}

export default function BackgroundMusic() {
  const [play, { sound }] = useSound(
    "https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/bg_music.mp3",
    { volume: 0.18, loop: true, interrupt: false }
  );

  // Expose Howl instance for external fade control (e.g. useMartyrTTS)
  useEffect(() => {
    if (sound) window.bgMusic = sound as unknown as Howl;
    return () => { window.bgMusic = undefined; };
  }, [sound]);

  // Auto-play; retry on first user interaction for Safari/iOS autoplay policy
  useEffect(() => {
    const tryPlay = () => play();
    tryPlay();

    const onInteraction = () => { tryPlay(); removeListeners(); };
    const events = ["click", "touchstart", "keydown", "mousedown", "pointerdown"] as const;
    const removeListeners = () => events.forEach(e => document.removeEventListener(e, onInteraction));

    events.forEach(e => document.addEventListener(e, onInteraction, { once: true }));
    return removeListeners;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
