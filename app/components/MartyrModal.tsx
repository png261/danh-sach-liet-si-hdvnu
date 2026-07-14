"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Crosshair, Volume2, VolumeX, Loader2, X } from "lucide-react";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";
import { LotusMotif } from "@/app/components/VietnameseMotifs";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

interface Props {
  martyr: Martyr;
  onClose: () => void;
  onLocate: (martyr: Martyr) => void;
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "Chưa rõ"}</span>
    </div>
  );
}

function InfoRowFull({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-item full-width">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
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

export default function MartyrModal({ martyr, onClose, onLocate }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAll = useCallback(() => {
    // Stop Web Speech API
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

  // Stop when unmounting
  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  // Stop when changing martyr
  useEffect(() => {
    stopAll(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [martyr.id, stopAll]);

  const handleSpeak = async () => {
    if (isSpeaking || isLoading) {
      stopAll();
      return;
    }

    setIsLoading(true);

    // Try playing pre-generated audio from Supabase
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

        audio.onerror = () => {
          resolve(false);
        };
      });
    };

    const success = await playPreGenerated();
    if (success) return;

    // Fallback to native Web Speech API
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
        if (typeof window !== "undefined" && window.bgMusic) {
          window.bgMusic.fade(window.bgMusic.volume(), 0.03, 1000);
        }
      };
      utterance.onend   = () => {
        setIsSpeaking(false);
        if (typeof window !== "undefined" && window.bgMusic) {
          window.bgMusic.fade(window.bgMusic.volume(), 0.18, 1000);
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
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

  return (
    <>
      <Modal
        open={true}
        onClose={onClose}
        center
        showCloseIcon={false}
        classNames={{
          overlay: "custom-modal-overlay",
          modal: "custom-modal-container-detail",
        }}
      >
        <div
          className="modal-content"
          style={{
            border: "none",
            borderRadius: "0",
            backgroundColor: "transparent",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            maxHeight: "none",
            width: "100%",
            height: "100%"
          }}
        >
          {/* Lotus watermark */}
          <LotusMotif
            size={140}
            style={{ position: "absolute", bottom: "10px", left: "10px", opacity: 0.07, zIndex: 0 }}
          />

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Đóng cửa sổ tiểu sử"
            style={{ zIndex: 10, display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <X size={15} />
            <span>Đóng</span>
          </button>

          {/* Header */}
          <div style={{ padding: "1.25rem 1.5rem 0.25rem 1.5rem", borderBottom: "1px solid #EADFCE", flexShrink: 0, position: "relative", zIndex: 1 }}>
            {/* Title */}
            <div className="modal-title-area" style={{ textAlign: "center" }}>
              <h2 className="modal-title" style={{ color: "var(--primary-red)", fontStyle: "normal", marginTop: "0.25rem", marginBottom: "0.25rem" }}>
                {martyr.name}
              </h2>

              {/* Audio Speech Control */}
              <button
                onClick={handleSpeak}
                disabled={isLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "0.6rem",
                  padding: "8px 20px",
                  borderRadius: "24px",
                  backgroundColor:
                    isLoading ? "rgba(164,123,46,0.12)" :
                    isSpeaking ? "var(--primary-red)" :
                    "rgba(164,123,46,0.08)",
                  color: isSpeaking ? "#FFFFFF" : "var(--gold)",
                  border: "1px solid " + (isSpeaking ? "var(--primary-red)" : "rgba(164,123,46,0.25)"),
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: isLoading ? "wait" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                }}
                className="modal-speak-btn"
              >
                {isLoading ? (
                  <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                ) : isSpeaking ? (
                  <VolumeX size={15} />
                ) : (
                  <Volume2 size={15} />
                )}
                <span>
                  {isLoading ? "Đang tải giọng đọc..." :
                   isSpeaking ? "Bấm để dừng đọc" :
                   "Bấm để nghe đọc tiểu sử"}
                </span>
              </button>
            </div>
          </div>

          {/* Body (Scrollable) */}
          <div className="modal-body" style={{ padding: "1.25rem 1.5rem", flex: 1, overflowY: "auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Grave location */}
            <div className="grave-location-box" style={{ backgroundColor: "#F7F3E8", border: "1px solid #EADFCE", borderRadius: "8px", padding: "0.75rem", marginTop: 0 }}>
              <div
                className="grave-location-title"
                style={{ color: "var(--primary-red)", borderBottom: "1px solid rgba(164,123,46,0.15)", paddingBottom: "0.4rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "0.85rem" }}
              >
                <MapPin size={15} />
                VỊ TRÍ PHẦN MỘ — {martyr.cemetery}
              </div>
              <div className="grave-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", textAlign: "center" }}>
                {[
                  { label: "Số mộ", value: martyr.grave_no },
                  { label: "Hàng",  value: martyr.row_no },
                  { label: "Khu",   value: getPhysicalZone(martyr) },
                  { label: "Lô",    value: martyr.lot },
                ].map(({ label, value }) => (
                  <div key={label} className="grave-part" style={{ display: "flex", flexDirection: "column", padding: "4px", backgroundColor: "#FAF6EE", borderRadius: "4px" }}>
                    <span className="grave-part-label" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{label}</span>
                    <span className="grave-part-val"   style={{ color: "var(--text-bright)", fontWeight: "700", fontSize: "0.95rem" }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.72rem", color: "var(--primary-red)", fontStyle: "italic", textAlign: "center", width: "100%" }}>
                * Gia đình hãy bấm nút &quot;Xem vị trí sơ đồ&quot; màu đỏ ở dưới cùng để xem bản đồ chỉ đường.
              </p>
            </div>

            {/* Bio */}
            <div className="info-grid">
              <InfoRow label="Năm sinh"            value={martyr.birth_year} />
              <InfoRow label="Nhập ngũ"            value={martyr.enlistment_date} />
              <InfoRow label="Cấp bậc"             value={martyr.rank} />
              <InfoRow label="Đơn vị"              value={martyr.unit} />
              <InfoRow label="Ngày hy sinh"        value={martyr.death_date} />
              <InfoRow label="Quê quán / Nguyên quán" value={martyr.hometown} />

              {martyr.relics         && <InfoRowFull label="Di vật lưu giữ"          value={martyr.relics} />}
              {martyr.gather_location && <InfoRowFull label="Địa điểm quy tập"       value={martyr.gather_location} />}
              {(martyr.move_location || martyr.move_person) && (
                <InfoRowFull
                  label="Thông tin di chuyển hài cốt"
                  value={[
                    martyr.move_location && `Di chuyển về: ${martyr.move_location}.`,
                    martyr.move_person   && `Người di chuyển: ${martyr.move_person}.`,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}
              {martyr.notes && <InfoRowFull label="Ghi chú" value={martyr.notes} />}
            </div>
          </div>

          {/* Footer */}
          <div
            className="modal-footer"
            style={{ 
              borderTop: "1px solid #EADFCE", 
              padding: "0.75rem 1.5rem", 
              backgroundColor: "#FAF6EE", 
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
              zIndex: 1
            }}
          >
            <button 
              className="modal-location-route-btn" 
              onClick={() => onLocate(martyr)}
              style={{ width: "100%", maxWidth: "320px", margin: 0 }}
            >
              <Crosshair size={15} /> Xem vị trí trên sơ đồ
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
