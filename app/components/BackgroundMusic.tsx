"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { useCemeteryStore } from "@/app/hooks/useCemeteryStore";

// Expose the underlying Howl instance on window so useMartyrTTS
// can call .fade() to duck the music during TTS playback.
declare global {
  interface Window { bgMusic?: Howl; }
}

export default function BackgroundMusic() {
  const isMusicMuted = useCemeteryStore((state) => state.isMusicMuted);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Create Howl instance
    const sound = new Howl({
      src: ["/bg_music.mp3"],
      html5: true,
      loop: true,
      volume: 0.18,
      autoplay: !isMusicMuted
    });
    soundRef.current = sound;
    sound.mute(isMusicMuted);
    window.bgMusic = sound;

    const tryPlay = () => {
      if (sound.state() === "unloaded") {
        sound.load();
      }
      if (!sound.playing() && !isMusicMuted) {
        sound.play();
      }
    };

    tryPlay();

    const handleInteraction = () => {
      tryPlay();
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("mousedown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("pointerdown", handleInteraction);

    return () => {
      removeListeners();
      sound.stop();
      sound.unload();
      soundRef.current = null;
      window.bgMusic = undefined;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle mute/unmute
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.mute(isMusicMuted);
      if (!isMusicMuted && !soundRef.current.playing()) {
        soundRef.current.play();
      }
    }
  }, [isMusicMuted]);

  return null;
}
