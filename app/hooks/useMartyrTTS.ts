"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";
import { toast } from "sonner";

const makeSafeId = (id: string) => {
  if (!id) return "";
  return id
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

export function useMartyrTTS(martyr: Martyr) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAll = useCallback(() => {
    // Dừng Web Speech API
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Dừng Supabase audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);

    // Phục hồi âm lượng nhạc nền
    if (typeof window !== "undefined" && (window as any).bgMusic) {
      (window as any).bgMusic.fade((window as any).bgMusic.volume(), 0.18, 1000);
    }
  }, []);

  // Dừng âm thanh khi unmount
  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  // Dừng âm thanh khi đổi liệt sĩ
  useEffect(() => {
    stopAll();
  }, [martyr.id, stopAll]);

  const handleSpeak = async () => {
    if (isSpeaking || isLoading) {
      stopAll();
      return;
    }

    setIsLoading(true);

    // Thử phát file âm thanh đã được gen sẵn trên Supabase
    const audioUrl = `https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/audios/${makeSafeId(martyr.id)}.mp3`;
    
    const playPreGenerated = () => {
      return new Promise<boolean>((resolve) => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          audio.play()
            .then(() => {
              setIsLoading(false);
              setIsSpeaking(true);
              // Giảm âm lượng nhạc nền
              if (typeof window !== "undefined" && (window as any).bgMusic) {
                (window as any).bgMusic.fade((window as any).bgMusic.volume(), 0.03, 1000);
              }
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        };

        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          // Phục hồi âm lượng nhạc nền
          if (typeof window !== "undefined" && (window as any).bgMusic) {
            (window as any).bgMusic.fade((window as any).bgMusic.volume(), 0.18, 1000);
          }
        };

        audio.onerror = () => {
          resolve(false);
        };
      });
    };

    const success = await playPreGenerated();
    if (success) return;

    // Fallback: Sử dụng Web Speech API của trình duyệt
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsLoading(false);
      toast.error("Trình duyệt của bạn không hỗ trợ đọc thành tiếng.");
      return;
    }

    const textToSpeak = [
      "Thông tin Anh hùng Liệt sĩ.",
      `Họ và tên: ${martyr.name}.`,
      `Nghĩa trang: ${martyr.cemetery}.`,
      `Vị trí phần mộ: Mộ số ${martyr.grave_no || "Chưa rõ"}, hàng số ${martyr.row_no || "Chưa rõ"}, khu vực ${getPhysicalZone(martyr) || "Chưa rõ"}.`,
      martyr.birth_year      ? `Sinh năm: ${martyr.birth_year}.`      : "",
      martyr.hometown        ? `Quê quán: ${martyr.hometown}.`        : "",
      martyr.enlistment_date ? `Nhập ngũ: ${martyr.enlistment_date}.` : "",
      martyr.rank            ? `Cấp bậc: ${martyr.rank}.`             : "",
      martyr.unit            ? `Đơn vị: ${martyr.unit}.`              : "",
      martyr.death_date      ? `Hy sinh ngày: ${martyr.death_date}.`  : "",
    ].filter(Boolean).join(" ");

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang  = "vi-VN";
    utterance.rate  = 0.88;
    utterance.pitch = 1;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      return (
        voices.find(v => v.lang === "vi-VN" && /google/i.test(v.name)) ||
        voices.find(v => v.lang === "vi-VN") ||
        voices.find(v => v.lang.startsWith("vi")) ||
        null
      );
    };

    const speak = () => {
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        setIsLoading(false);
        setIsSpeaking(true);
        if (typeof window !== "undefined" && (window as any).bgMusic) {
          (window as any).bgMusic.fade((window as any).bgMusic.volume(), 0.03, 1000);
        }
      };
      utterance.onend   = () => {
        setIsSpeaking(false);
        if (typeof window !== "undefined" && (window as any).bgMusic) {
          (window as any).bgMusic.fade((window as any).bgMusic.volume(), 0.18, 1000);
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        if (typeof window !== "undefined" && (window as any).bgMusic) {
          (window as any).bgMusic.fade((window as any).bgMusic.volume(), 0.18, 1000);
        }
      };
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speak();
      };
    } else {
      speak();
    }
  };

  return {
    isSpeaking,
    isLoading,
    handleSpeak,
    stopAll,
  };
}
