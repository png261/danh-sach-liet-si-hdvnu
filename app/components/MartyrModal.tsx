"use client";

import { MapPin, Crosshair, Volume2, VolumeX, Loader2, Printer } from "lucide-react";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";
import { LotusMotif } from "@/app/components/VietnameseMotifs";
import { useMartyrTTS } from "@/app/hooks/useMartyrTTS";
import Equalizer from "@/app/components/Equalizer";
import { Modal } from "react-responsive-modal";
import { QRCodeSVG } from "qrcode.react";
import "react-responsive-modal/styles.css";
import { getVietnameseLunarDateString } from "@/app/utils/lunar";

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
  const { isSpeaking, isLoading, handleSpeak } = useMartyrTTS(martyr);

  const lunarDeathDate = getVietnameseLunarDateString(martyr.death_date);
  const displayDeathDate = lunarDeathDate 
    ? `${martyr.death_date} (tức ngày ${lunarDeathDate})`
    : martyr.death_date;

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
            <span>Đóng</span>
          </button>

          {/* Header */}
          <div style={{ padding: "1.25rem 1.5rem 0.25rem 1.5rem", borderBottom: "1px solid #EADFCE", flexShrink: 0, position: "relative", zIndex: 1 }}>
            {/* Title */}
            <div className="modal-title-area" style={{ textAlign: "center" }}>
              <h2 className="modal-title" style={{ color: "var(--primary-red)", fontStyle: "normal", marginTop: "0.25rem", marginBottom: "0.25rem" }}>
                {martyr.name}
              </h2>

              {/* Audio Speech Control & Print Document */}
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "0.6rem" }}>
                <button
                  onClick={handleSpeak}
                  disabled={isLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
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
                    <Equalizer size={15} />
                  ) : (
                    <Volume2 size={15} />
                  )}
                  <span>
                    {isLoading ? "Đang tải..." :
                     isSpeaking ? "Dừng đọc" :
                     "Nghe đọc"}
                  </span>
                </button>

                <button
                  onClick={() => window.print()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 20px",
                    borderRadius: "24px",
                    backgroundColor: "rgba(164,123,46,0.08)",
                    color: "var(--gold)",
                    border: "1px solid rgba(164,123,46,0.25)",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                  }}
                  className="modal-print-btn"
                >
                  <Printer size={15} />
                  <span>In / Lưu PDF</span>
                </button>
              </div>
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
              <InfoRow label="Ngày hy sinh"        value={displayDeathDate} />
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

      {/* Printable container (hidden on screen, visible only during print) */}
      <div className="printable-profile-container">
        <div className="print-header">
          <div className="print-logo-text">ĐỘI SINH VIÊN TÌNH NGUYỆN HẢI DƯƠNG TẠI ĐHQGHN — ĐOÀN XÃ TỨ KỲ</div>
          <h1 className="print-title font-serif">HỒ SƠ THÔNG TIN LIỆT SĨ</h1>
        </div>

        <div className="print-body">
          <div className="print-name font-serif">{martyr.name}</div>
          
          <div className="print-location-details">
            <strong>Nghĩa trang:</strong> {martyr.cemetery} <br/>
            <strong>Vị trí phần mộ:</strong> Khu {getPhysicalZone(martyr)} — Hàng {martyr.row_no || "Chưa rõ"} — Mộ số {martyr.grave_no || "Chưa rõ"}
          </div>

          <table className="print-table">
            <tbody>
              <tr>
                <td><strong>Năm sinh:</strong></td>
                <td>{martyr.birth_year || "Chưa rõ"}</td>
                <td><strong>Nhập ngũ:</strong></td>
                <td>{martyr.enlistment_date || "Chưa rõ"}</td>
              </tr>
              <tr>
                <td><strong>Cấp bậc:</strong></td>
                <td>{martyr.rank || "Chưa rõ"}</td>
                <td><strong>Đơn vị:</strong></td>
                <td>{martyr.unit || "Chưa rõ"}</td>
              </tr>
              <tr>
                <td><strong>Ngày hy sinh:</strong></td>
                <td>{displayDeathDate || "Chưa rõ"}</td>
                <td><strong>Quê quán:</strong></td>
                <td>{martyr.hometown || "Chưa rõ"}</td>
              </tr>
              {martyr.relics && (
                <tr>
                  <td colSpan={4}><strong>Di vật lưu giữ:</strong> {martyr.relics}</td>
                </tr>
              )}
              {martyr.gather_location && (
                <tr>
                  <td colSpan={4}><strong>Địa điểm quy tập:</strong> {martyr.gather_location}</td>
                </tr>
              )}
              {martyr.notes && (
                <tr>
                  <td colSpan={4}><strong>Ghi chú:</strong> {martyr.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="print-footer">
          <div className="print-qr-section">
            <QRCodeSVG 
              value={typeof window !== "undefined"
                ? `${window.location.origin}${window.location.pathname}?liet-si=${martyr.id}`
                : `https://nghiatrangtuky.vercel.app/[cemetery]?liet-si=${martyr.id}`} 
              size={90} 
            />
            <p>Quét mã QR để định vị nhanh sơ đồ vị trí phần mộ trực tuyến trên Bản đồ số nghĩa trang.</p>
          </div>
          <div className="print-signature">
            <p style={{ margin: 0, fontStyle: "italic", fontSize: "9pt", fontWeight: "normal" }}>Tứ Kỳ, Hải Dương</p>
            <p style={{ margin: "5px 0 0 0" }}>Đoàn xã Tứ Kỳ kính dâng</p>
          </div>
        </div>
      </div>
    </>
  );
}
