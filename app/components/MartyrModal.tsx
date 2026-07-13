"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Crosshair, Volume2, VolumeX, Loader2 } from "lucide-react";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";
import { LotusMotif, CloudDivider } from "@/app/components/VietnameseMotifs";
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

export default function MartyrModal({ martyr, onClose, onLocate }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stopAll = useCallback(() => {
    // Stop Web Speech API
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // Stop everything when modal unmounts
  useEffect(() => {
    return () => {
      stopAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpeak = async () => {
    // If currently speaking or loading, stop
    if (isSpeaking || isLoading) {
      stopAll();
      return;
    }

    // Compose rich Vietnamese biography text
    const textToSpeak = [
      "Thông tin Anh hùng Liệt sĩ.",
      `Họ và tên: ${martyr.name}.`,
      `Nghĩa trang: ${martyr.cemetery}.`,
      `Vị trí phần mộ: Mộ số ${martyr.grave_no || "Chưa rõ"}, hàng số ${martyr.row_no || "Chưa rõ"}, khu vực ${getPhysicalZone(martyr) || "Chưa rõ"}.`,
      martyr.birth_year ? `Sinh năm: ${martyr.birth_year}.` : "",
      martyr.hometown ? `Quê quán: ${martyr.hometown}.` : "",
      martyr.enlistment_date ? `Nhập ngũ: ${martyr.enlistment_date}.` : "",
      martyr.rank ? `Cấp bậc: ${martyr.rank}.` : "",
      martyr.unit ? `Đơn vị: ${martyr.unit}.` : "",
      martyr.death_date ? `Hy sinh ngày: ${martyr.death_date}.` : "",
      martyr.relics ? `Di vật lưu giữ: ${martyr.relics}.` : "",
      martyr.notes ? `Ghi chú: ${martyr.notes}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    setIsLoading(true);

    // ── Step 2: Browser-native Web Speech API (no server, no timeout) ──
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsLoading(false);
      alert("Trình duyệt của bạn không hỗ trợ đọc thành tiếng.");
      return;
    }

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
      utterance.onstart = () => { setIsLoading(false); setIsSpeaking(true); };
      utterance.onend   = () => { setIsSpeaking(false); };
      utterance.onerror = () => { setIsSpeaking(false); setIsLoading(false); };
      window.speechSynthesis.speak(utterance);
    };

    // Chrome loads voices asynchronously on first call
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
          style={{ zIndex: 10 }}
        >
          Đóng
        </button>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem 0.25rem 1.5rem", borderBottom: "1px solid #EADFCE", flexShrink: 0, position: "relative", zIndex: 1 }}>
          {/* Title */}
          <div className="modal-title-area" style={{ textAlign: "center" }}>
            <h2 className="modal-title" style={{ color: "var(--primary-red)", fontStyle: "normal", marginTop: "0.25rem", marginBottom: "0.25rem" }}>
              {martyr.name}
            </h2>

            {/* Audio Speech Control — Edge TTS (giọng nữ Hoài My) */}
            <button
              onClick={handleSpeak}
              disabled={isLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "0.5rem",
                padding: "6px 16px",
                borderRadius: "20px",
                backgroundColor:
                  isLoading ? "rgba(164,123,46,0.12)" :
                  isSpeaking ? "var(--primary-red)" :
                  "rgba(164,123,46,0.08)",
                color: isSpeaking ? "#FFFFFF" : "var(--gold)",
                border: "1px solid " + (isSpeaking ? "var(--primary-red)" : "rgba(164,123,46,0.25)"),
                fontSize: "0.75rem",
                fontWeight: "600",
                cursor: isLoading ? "wait" : "pointer",
                transition: "all 0.2s ease",
              }}
              className="modal-speak-btn"
            >
              {isLoading ? (
                <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
              ) : isSpeaking ? (
                <VolumeX size={12} />
              ) : (
                <Volume2 size={12} />
              )}
              <span>
                {isLoading ? "Đang tổng hợp giọng đọc..." :
                 isSpeaking ? "Dừng đọc" :
                 "Nghe tiểu sử liệt sĩ"}
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
                <div key={label} className="grave-part" style={{ display: "flex", flexDirection: "column" }}>
                  <span className="grave-part-label" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{label}</span>
                  <span className="grave-part-val"   style={{ color: "var(--text-bright)", fontWeight: "700", fontSize: "0.95rem" }}>{value || "—"}</span>
                </div>
              ))}
            </div>
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
  );
}
