"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { Loader2, Download, Link2, Check } from "lucide-react";
import { useEventListener, useCopyToClipboard } from "usehooks-ts";
import { FacebookShareButton } from "react-share";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";
import { LotusMotif } from "@/app/components/VietnameseMotifs";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { getVietnameseLunarDateString } from "@/app/utils/lunar";
import StyledQRCode from "@/app/components/StyledQRCode";

interface MartyrShareModalProps {
  martyr: Martyr;
  onClose: () => void;
}

interface MemorialCardProps {
  martyr: Martyr;
  logoSvtnBase64: string;
  logoSvtnUrl: string;
  logoDoanXaBase64: string;
  logoDoanXaUrl: string;
  shareUrl: string;
}

const MemorialCard = forwardRef<HTMLDivElement, MemorialCardProps>(({
  martyr,
  logoSvtnBase64,
  logoSvtnUrl,
  logoDoanXaBase64,
  logoDoanXaUrl,
  shareUrl
}, ref) => {
  const lunarDeathDate = getVietnameseLunarDateString(martyr.death_date);
  const displayDeathDate = lunarDeathDate 
    ? `${martyr.death_date} (tức ngày ${lunarDeathDate})`
    : (martyr.death_date || "Chưa rõ");

  return (
    <div
      ref={ref}
      className="memorial-card-preview-inner"
    >
      {/* Header Logos */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #EADFCE", paddingBottom: "0.75rem", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <img src={logoSvtnBase64 || logoSvtnUrl} alt="Logo Đội" style={{ width: "45px", height: "45px", objectFit: "contain" }} />
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--primary-red)", lineHeight: "1.2", fontFamily: "sans-serif" }}>Đội Sinh viên tình nguyện Hải Dương</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--primary-red)", lineHeight: "1.2", fontFamily: "sans-serif" }}>tại Đại học Quốc gia Hà Nội</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <img src={logoDoanXaBase64 || logoDoanXaUrl} alt="Logo Đoàn" style={{ width: "45px", height: "45px", objectFit: "contain" }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--primary-red)", fontFamily: "sans-serif" }}>Đoàn Xã Tứ Kỳ</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem 0", position: "relative" }}>
        <div style={{ position: "absolute", opacity: 0.05, zIndex: 0, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <LotusMotif size={280} />
        </div>

        <div style={{ zIndex: 1, width: "100%", textAlign: "center" }}>
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#5D4037", letterSpacing: "2px" }}>
            PHIẾU TƯỞNG NIỆM & TRI ÂN
          </p>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", color: "var(--primary-red)", fontFamily: "var(--font-serif-family), Georgia, serif", fontWeight: "700" }}>
            {martyr.name}
          </h1>
          <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.82rem", fontStyle: "italic", fontWeight: "600", color: "#5D4037", letterSpacing: "0.5px" }}>
            &quot;Đời đời nhớ ơn các Anh hùng Liệt sĩ&quot;
          </p>

          {/* Grave location */}
          <div style={{ backgroundColor: "#F7F3E8", border: "1px solid #EADFCE", borderRadius: "8px", padding: "1rem", margin: "0 auto 1.5rem auto", maxWidth: "440px" }}>
            <p style={{ margin: "0 0 0.6rem 0", fontSize: "0.8rem", fontWeight: "700", color: "var(--primary-red)", borderBottom: "1px dashed rgba(164,123,46,0.2)", paddingBottom: "0.4rem" }}>
              THÔNG TIN PHẦN MỘ — {martyr.cemetery}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", fontSize: "0.8rem" }}>
              <div>
                <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.68rem" }}>Số mộ</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-bright)" }}>{martyr.grave_no || "—"}</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.68rem" }}>Hàng</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-bright)" }}>{martyr.row_no || "—"}</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.68rem" }}>Khu</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-bright)" }}>{getPhysicalZone(martyr) || "—"}</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.68rem" }}>Lô</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-bright)" }}>{martyr.lot || "—"}</strong>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.85rem", maxWidth: "480px", margin: "0 auto" }}>
            <div><strong>Năm sinh:</strong> {martyr.birth_year || "Chưa rõ"}</div>
            <div><strong>Nhập ngũ:</strong> {martyr.enlistment_date || "Chưa rõ"}</div>
            <div><strong>Cấp bậc:</strong> {martyr.rank || "Chưa rõ"}</div>
            <div><strong>Đơn vị:</strong> {martyr.unit || "Chưa rõ"}</div>
            <div style={{ gridColumn: "span 2" }}><strong>Ngày hy sinh:</strong> {displayDeathDate}</div>
            <div style={{ gridColumn: "span 2" }}><strong>Quê quán:</strong> {martyr.hometown || "Chưa rõ"}</div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #EADFCE", paddingTop: "1rem", width: "100%", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "6px", borderRadius: "6px", border: "1px solid #EADFCE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StyledQRCode
              value={shareUrl}
              size={65}
            />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.64rem", color: "var(--text-muted)", width: "140px", lineHeight: 1.4 }}>
              Quét mã QR để truy cập nhanh sơ đồ vị trí phần mộ trực tuyến trên Bản đồ số.
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.64rem", fontWeight: "700", color: "#C2A267" }}>
              nghiatrangtuky.vercel.app
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "0.7rem", fontStyle: "italic", color: "#5D4037" }}>
            Tứ Kỳ, Hải Dương
          </p>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", fontWeight: "700", color: "var(--primary-red)", letterSpacing: "1px" }}>
            Đoàn xã Tứ Kỳ kính dâng
          </p>
        </div>
      </div>
    </div>
  );
});
MemorialCard.displayName = "MemorialCard";

export default function MartyrShareModal({ martyr, onClose }: MartyrShareModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const logoSvtnUrl = typeof window !== "undefined" ? `${window.location.origin}/logo_svtn.webp` : "/logo_svtn.webp";
  const logoDoanXaUrl = typeof window !== "undefined" ? `${window.location.origin}/logo_doan_xa.webp` : "/logo_doan_xa.webp";

  const [logoSvtnBase64, setLogoSvtnBase64] = useState<string>("");
  const [logoDoanXaBase64, setLogoDoanXaBase64] = useState<string>("");

  /** Chuyển URL ảnh sang base64 data URL (để html-to-image nhúng inline, tránh lỗi CORS) */
  const imageUrlToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    Promise.all([
      imageUrlToBase64("/logo_svtn.webp").catch(() => ""),
      imageUrlToBase64("/logo_doan_xa.webp").catch(() => ""),
    ]).then(([svtn, doan]) => {
      setLogoSvtnBase64(svtn);
      setLogoDoanXaBase64(doan);
    });
  }, []);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?liet-si=${martyr.id}`
    : `https://nghiatrangtuky.vercel.app/[cemetery]?liet-si=${martyr.id}`;

  const handleDownloadCard = () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    import("html-to-image").then(({ toPng }) => {
      setTimeout(() => {
        toPng(cardRef.current!, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: "#FCFAF6",
          style: {
            opacity: "1",
            visibility: "visible",
            transform: "none"
          }
        })
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = `Phieu_Tri_An_${martyr.name.replace(/\s+/g, "_")}.png`;
            link.href = dataUrl;
            link.click();
            setIsExporting(false);
          })
          .catch((err) => {
            console.error("Error generating card image:", err);
            setIsExporting(false);
          });
      }, 150);
    });
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
          modal: "custom-modal-container-share"
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
            size={100}
            style={{ position: "absolute", bottom: "10px", right: "10px", opacity: 0.05, zIndex: 0 }}
          />

          {/* Body */}
          <div className="modal-body" style={{ padding: "1.25rem", flex: 1, overflowY: "auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            
            {/* Ảnh tưởng niệm preview trực quan */}
            <div className="memorial-card-preview-wrapper">
              <MemorialCard
                ref={cardRef}
                martyr={martyr}
                logoSvtnBase64={logoSvtnBase64}
                logoSvtnUrl={logoSvtnUrl}
                logoDoanXaBase64={logoDoanXaBase64}
                logoDoanXaUrl={logoDoanXaUrl}
                shareUrl={shareUrl}
              />
            </div>

            {/* Các nút tùy chọn: Lưu ảnh tri ân (full-width), Facebook & Zalo song song */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "380px", marginTop: "0.25rem" }}>
              <button
                onClick={handleDownloadCard}
                disabled={isExporting}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  backgroundColor: "var(--gold)",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: isExporting ? "wait" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 3px 8px rgba(164, 123, 46, 0.25)"
                }}
              >
                {isExporting ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Download size={14} />
                )}
                <span>{isExporting ? "Đang tạo và tải ảnh..." : "Lưu ảnh tưởng niệm về máy"}</span>
              </button>

              <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                <a
                  href={`https://sp.zalo.me/share/share-web?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#0068FF",
                    color: "#FFFFFF",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#FFFFFF", color: "#0068FF", fontSize: "10px", fontWeight: "900", fontFamily: "sans-serif" }}>Z</span>
                  <span>Chia sẻ Zalo</span>
                </a>

                <FacebookShareButton
                  url={shareUrl}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#1877F2",
                    color: "#FFFFFF",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style={{ flexShrink: 0 }}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Chia sẻ Facebook</span>
                  </div>
                </FacebookShareButton>
              </div>

              {/* Copy Link — chia sẻ qua Zalo tin nhắn, iMessage, v.v. */}
              <button
                onClick={async () => {
                  const ok = await copy(shareUrl);
                  if (ok) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }
                }}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  backgroundColor: copied ? "#2e7d32" : "#f5f0e8",
                  color: copied ? "#fff" : "var(--text-muted)",
                  border: `1px solid ${copied ? "#2e7d32" : "#EADFCE"}`,
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              >
                {copied ? <Check size={14} /> : <Link2 size={14} />}
                <span>{copied ? "Đã sao chép liên kết!" : "Sao chép liên kết"}</span>
              </button>
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
              onClick={onClose}
              style={{
                width: "100%",
                maxWidth: "320px",
                margin: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "var(--primary-red)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "30px",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                padding: "0.65rem 1.2rem",
                transition: "all 0.2s ease"
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
