"use client";

import { useEffect, useRef } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/bg_music.mp3");
    audio.loop = true;
    audio.volume = 0.18;
    audioRef.current = audio;

    // Try auto-play immediately; if blocked, play on first user interaction
    const tryPlay = () => {
      audio.play().catch(() => {});
    };

    tryPlay();

    // Fallback: play on first touch/click anywhere on the page
    const onFirstInteraction = () => {
      tryPlay();
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
    };

    document.addEventListener("click", onFirstInteraction);
    document.addEventListener("touchstart", onFirstInteraction);
    document.addEventListener("keydown", onFirstInteraction);

    return () => {
      audio.pause();
      audio.src = "";
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  return null;
}
