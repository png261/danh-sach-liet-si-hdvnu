"use client";

import { useState, useEffect, useCallback } from "react";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";

interface MartyrBottomCardProps {
  martyr: Martyr;
  onClose: () => void;
  onOpenFullModal: () => void;
  onLocate: (martyr: Martyr) => void;
}

export default function MartyrBottomCard({
  martyr,
  onClose,
  onOpenFullModal,
  onLocate,
}: MartyrBottomCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);

  const stopAll = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // Dừng khi unmount
  useEffect(() => { return () => stopAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dừng khi đổi liệt sĩ
  useEffect(() => { stopAll(); }, [martyr.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSpeak = () => {
    if (isSpeaking || isLoading) { stopAll(); return; }

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

    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Trình duyệt của bạn không hỗ trợ đọc thành tiếng.");
      return;
    }

    setIsLoading(true);
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

          {/* Nghe tiểu sử bằng giọng đọc */}
          <button
            className={`bottom-card-btn bottom-card-btn-speak${isSpeaking ? " speaking" : ""}`}
            onClick={handleSpeak}
            disabled={isLoading}
            aria-label={isSpeaking ? "Dừng đọc tiểu sử" : "Nghe tiểu sử liệt sĩ"}
          >
            {isLoading ? "Đang tải..." : isSpeaking ? "Dừng đọc" : "Nghe tiểu sử"}
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
