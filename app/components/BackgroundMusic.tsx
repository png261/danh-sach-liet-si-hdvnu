"use client";

import { useEffect } from "react";
import { Howl } from "howler";

// Declare global properties for TypeScript compatibility
declare global {
  interface Window {
    bgMusic?: Howl;
  }
}

export default function BackgroundMusic() {
  useEffect(() => {
    const sound = new Howl({
      src: ["https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/bg_music.mp3"],
      html5: false,
      loop: true,
      volume: 0.18
    });

    if (typeof window !== "undefined") {
      window.bgMusic = sound;
    }

    const tryPlay = () => {
      if (sound.state() === "unloaded") {
        sound.load();
      }
      if (!sound.playing()) {
        sound.play();
      }
    };

    tryPlay();

    // Fallback: Safari/iOS blocks autoplay until first interaction
    const onFirstInteraction = () => {
      tryPlay();
      removeListeners();
    };

    const removeListeners = () => {
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
      document.removeEventListener("mousedown", onFirstInteraction);
      document.removeEventListener("pointerdown", onFirstInteraction);
    };

    if (!sound.playing()) {
      document.addEventListener("click", onFirstInteraction);
      document.addEventListener("touchstart", onFirstInteraction);
      document.addEventListener("keydown", onFirstInteraction);
      document.addEventListener("mousedown", onFirstInteraction);
      document.addEventListener("pointerdown", onFirstInteraction);
    }

    return () => {
      sound.unload();
      if (typeof window !== "undefined") {
        window.bgMusic = undefined;
      }
      removeListeners();
    };
  }, []);

  return null;
}
