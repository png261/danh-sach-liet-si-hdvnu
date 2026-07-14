"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, Loader2, Share2 } from "lucide-react";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";

interface MartyrBottomCardProps {
  martyr: Martyr;
  onClose: () => void;
  onOpenFullModal: () => void;
  onOpenShareModal: () => void;
  onLocate: (martyr: Martyr) => void;
}

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

export default function MartyrBottomCard({
  martyr,
  onClose,
  onOpenFullModal,
  onOpenShareModal,
  onLocate,
}: MartyrBottomCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAll = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Stop Supabase audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);

    // Restore background music volume
    if (typeof window !== "undefined" && window.bgMusic) {
      window.bgMusic.fade(window.bgMusic.volume(), 0.18, 1000);
    }
  }, []);

  // Dừng khi unmount
  useEffect(() => { return () => stopAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dừng khi đổi liệt sĩ
  useEffect(() => { stopAll(); }, [martyr.id]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const handleSpeak = async () => {
    if (isSpeaking || isLoading) { stopAll(); return; }

    setIsLoading(true);

    // Try playing pre-generated audio from Supabase
    const audioUrl = `https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/audios/${makeSafeId(martyr.id)}.mp3`;
    
    const playPreGenerated = () => {
      return new Promise<boolean>((resolve) => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // When metadata is loaded, we know the file exists and is playable
        audio.onloadedmetadata = () => {
          audio.play()
            .then(() => {
              setIsLoading(false);
              setIsSpeaking(true);
              // Fade out background music
              if (typeof window !== "undefined" && window.bgMusic) {
                window.bgMusic.fade(window.bgMusic.volume(), 0.03, 1000);
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
          // Fade in background music
          if (typeof window !== "undefined" && window.bgMusic) {
            window.bgMusic.fade(window.bgMusic.volume(), 0.18, 1000);
          }
        };

        // If error loading, resolve as false to trigger fallback
        audio.onerror = () => {
          resolve(false);
        };
      });
    };

    // Try playing pre-generated speech
    const success = await playPreGenerated();
    if (success) {
      return;
    }

    // Fallback: Browser-native Web Speech API
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsLoading(false);
      alert("Trình duyệt của bạn không hỗ trợ đọc thành tiếng.");
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
        // Fade out background music
        if (typeof window !== "undefined" && window.bgMusic) {
          window.bgMusic.fade(window.bgMusic.volume(), 0.03, 1000);
        }
      };
      utterance.onend   = () => {
        setIsSpeaking(false);
        // Fade in background music
        if (typeof window !== "undefined" && window.bgMusic) {
          window.bgMusic.fade(window.bgMusic.volume(), 0.18, 1000);
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        // Fade in background music
        if (typeof window !== "undefined" && window.bgMusic) {
          window.bgMusic.fade(window.bgMusic.volume(), 0.18, 1000);
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

  const zone = getPhysicalZone(martyr);

  return (
    <div className="martyr-bottom-card" role="complementary" aria-label="Thông tin liệt sĩ được chọn">
      {/* Thanh kéo trang trí cho mobile */}
      <div className="bottom-card-handle" />

      <div className="bottom-card-inner">

        {/* ── Thông tin liệt sĩ ── */}
        <div className="bottom-card-info">
          <div className="bottom-card-name">{martyr.name}</div>

          <div className="bottom-card-location">
            Vị trí:&nbsp;
            <strong>Khu {zone}</strong>
            {martyr.row_no   && <>, Hàng {martyr.row_no}</>}
            {martyr.grave_no && <>, Mộ {martyr.grave_no}</>}
            &nbsp;—&nbsp;{martyr.cemetery}
          </div>

          {(martyr.birth_year || martyr.rank) && (
            <div className="bottom-card-meta">
              {martyr.birth_year && <span>Năm sinh: <strong>{martyr.birth_year}</strong></span>}
              {martyr.birth_year && martyr.rank && <span className="bottom-card-meta-dot">·</span>}
              {martyr.rank && <span>{martyr.rank}</span>}
            </div>
          )}
        </div>

        {/* ── Các nút thao tác (chỉ dùng chữ, không icon) ── */}
        <div className="bottom-card-actions">

          {/* Nghe tiểu sử bằng giọng đọc (dùng icon loa để tiết kiệm diện tích trên mobile) */}
          <button
            className={`bottom-card-btn bottom-card-btn-speak${isSpeaking ? " speaking" : ""}`}
            onClick={handleSpeak}
            disabled={isLoading}
            aria-label={isSpeaking ? "Dừng đọc tiểu sử" : "Nghe tiểu sử liệt sĩ"}
          >
            {isLoading ? (
              <Loader2 size={18} className="bottom-card-btn-spin" />
            ) : isSpeaking ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          {/* Chia sẻ & Tải ảnh tri ân (icon tròn nằm cạnh nút nghe giọng đọc) */}
          <button
            className="bottom-card-btn bottom-card-btn-speak"
            onClick={onOpenShareModal}
            aria-label="Chia sẻ thông tin và tải ảnh tri ân"
            style={{ width: "44px", minWidth: "44px", padding: 0, justifyContent: "center", flexShrink: 0 }}
          >
            <Share2 size={18} />
          </button>

          {/* Xem toàn bộ tiểu sử */}
          <button
            className="bottom-card-btn bottom-card-btn-detail"
            onClick={onOpenFullModal}
            aria-label="Xem tiểu sử đầy đủ của liệt sĩ"
          >
            Xem tiểu sử đầy đủ
          </button>

          {/* Đóng thanh thông tin */}
          <button
            className="bottom-card-btn bottom-card-btn-close"
            onClick={onClose}
            aria-label="Đóng bảng thông tin nhanh"
          >
            Đóng
          </button>

        </div>
      </div>
    </div>
  );
}
