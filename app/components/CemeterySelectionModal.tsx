"use client";

import { X, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { LotusMotif } from "@/app/components/VietnameseMotifs";


const CEMETERIES = [
  {
    id: "tu-ky",
    value: "Nghĩa trang liệt sĩ Tứ Kỳ",
    displayName: "NTLS Tứ Kỳ",
    fullName: "Nghĩa trang liệt sĩ Tứ Kỳ",
    image: "/real_tu_ky.webp",
  },
  {
    id: "minh-duc",
    value: "Nghĩa trang liệt sĩ Minh Đức",
    displayName: "NTLS Minh Đức",
    fullName: "Nghĩa trang liệt sĩ Minh Đức",
    image: "/real_minh_duc.webp",
  },
  {
    id: "quang-khai",
    value: "Nghĩa trang liệt sĩ Quang Khải",
    displayName: "NTLS Quang Khải",
    fullName: "Nghĩa trang liệt sĩ Quang Khải",
    image: "/real_quang_khai.webp",
  },
  {
    id: "quang-phuc",
    value: "Nghĩa trang liệt sĩ Quang Phục",
    displayName: "NTLS Quang Phục",
    fullName: "Nghĩa trang liệt sĩ Quang Phục",
    image: "/real_quang_phuc.webp",
  },
];

const CEMETERY_COUNTS: Record<string, number> = {
  "Nghĩa trang liệt sĩ Tứ Kỳ": 216,
  "Nghĩa trang liệt sĩ Minh Đức": 332,
  "Nghĩa trang liệt sĩ Quang Khải": 267,
  "Nghĩa trang liệt sĩ Quang Phục": 200,
};

interface CemeterySelectionModalProps {
  onClose: () => void;
  onSelect: (value: string) => void;
  selectedValue?: string;
}

export default function CemeterySelectionModal({
  onClose,
  onSelect,
  selectedValue,
}: CemeterySelectionModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);



  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="cem-modal-overlay" onClick={onClose}>
      <div className="cem-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Decorative Lotus */}
        <LotusMotif
          size={180}
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            opacity: 0.04,
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div className="cem-modal-header">
          <div className="cem-modal-header-content">
            <div className="cem-modal-title-wrapper">
              <h2 className="cem-modal-title font-serif">CHỌN NGHĨA TRANG LIỆT SĨ</h2>
            </div>
            <button
              onClick={onClose}
              className="cem-modal-close-btn"
              aria-label="Đóng cửa sổ"
            >
              <span className="cem-modal-close-text">Đóng</span>
            </button>
          </div>
        </div>

        {/* Cemetery Grid */}
        <div className="cem-modal-grid">
          {CEMETERIES.map((cem) => {
            const normalizedVal = cem.value.normalize("NFC");
            const count = CEMETERY_COUNTS[normalizedVal] || 0;
            const isSelected = selectedValue?.normalize("NFC") === normalizedVal;

            return (
              <div
                key={cem.id}
                className={`cem-card ${isSelected ? "cem-card--active" : ""}`}
                onClick={() => onSelect(cem.value)}
              >
                {/* Image Section */}
                <div className="cem-card-img-wrapper">
                  <img
                    src={cem.image}
                    alt={cem.fullName}
                    className="cem-card-img"
                  />
                  {isSelected && (
                    <div className="cem-card-selected-badge">
                      <span>Đang chọn</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="cem-card-body">
                  <h3 className="cem-card-name font-serif">{cem.fullName}</h3>
                  <div className="cem-card-meta">
                    <span className="cem-card-meta-item">
                      <MapPin size={13} className="cem-card-icon" />
                      Tứ Kỳ, Hải Dương
                    </span>
                    <span className="cem-card-meta-item">
                      <Search size={13} className="cem-card-icon" />
                      {count} phần mộ
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
