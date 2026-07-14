"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";
import { LotusMotif } from "@/app/components/VietnameseMotifs";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

interface MartyrShareModalProps {
  martyr: Martyr;
  onClose: () => void;
}

export default function MartyrShareModal({ martyr, onClose }: MartyrShareModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const logoSvtnUrl = typeof window !== "undefined" ? `${window.location.origin}/logo_svtn.webp` : "/logo_svtn.webp";
  const logoDoanXaUrl = typeof window !== "undefined" ? `${window.location.origin}/logo_doan_xa.webp` : "/logo_doan_xa.webp";

  const [logoSvtnBase64, setLogoSvtnBase64] = useState<string>("");
  const [logoDoanXaBase64, setLogoDoanXaBase64] = useState<string>("");

  useEffect(() => {
    // Fetch and convert logo_svtn to base64
    fetch("/logo_svtn.webp")
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoSvtnBase64(reader.result as string);
        reader.readAsDataURL(blob);
      }).catch(err => console.error("Error loading SVTN logo:", err));

    // Fetch and convert logo_doan_xa to base64
    fetch("/logo_doan_xa.webp")
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoDoanXaBase64(reader.result as string);
        reader.readAsDataURL(blob);
      }).catch(err => console.error("Error loading Đoàn logo:", err));
  }, []);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?martyr=${martyr.id}`
    : `https://nghiatrangtuky.vercel.app/[cemetery]?martyr=${martyr.id}`;

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
            
            {/* Ảnh tưởng niệm preview trực quan giống hệt 100% bản tải về */}
            <div className="memorial-card-preview-wrapper">
              <div className="memorial-card-preview-inner">
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  
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
                        <div style={{ gridColumn: "span 2" }}><strong>Ngày hy sinh:</strong> {martyr.death_date || "Chưa rõ"}</div>
                        <div style={{ gridColumn: "span 2" }}><strong>Quê quán:</strong> {martyr.hometown || "Chưa rõ"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #EADFCE", paddingTop: "1rem", width: "100%", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ backgroundColor: "#FFFFFF", padding: "6px", borderRadius: "6px", border: "1px solid #EADFCE" }}>
                        <QRCodeSVG
                          value={shareUrl}
                          size={65}
                          bgColor={"#FFFFFF"}
                          fgColor={"#9B1C26"}
                          level={"M"}
                          includeMargin={false}
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
              </div>
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

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
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
                    backgroundColor: "#1877F2",
                    color: "#FFFFFF",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    textDecoration: "none",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Chia sẻ Facebook</span>
                </a>
              </div>
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

      {/* Hidden container to hide the card from user view without breaking layout */}
      <div style={{ width: 0, height: 0, overflow: "hidden", position: "absolute", left: 0, top: 0 }}>
        {/* Hidden Memorial Card Template for html-to-image capture */}
        <div 
          ref={cardRef} 
          style={{ 
            width: "600px", 
            height: "820px", 
            backgroundColor: "#FCFAF6", 
            border: "12px double #C2A267", 
            padding: "2.5rem",
            boxSizing: "border-box",
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between",
            color: "#2D2722",
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            
            {/* Header with Logos matching Intro Page */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #EADFCE", paddingBottom: "0.75rem", width: "100%" }}>
              {/* Left Brand: SVTN */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <img src={logoSvtnBase64 || logoSvtnUrl} alt="Logo Đội" style={{ width: "45px", height: "45px", objectFit: "contain" }} />
                <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--primary-red)", lineHeight: "1.2", fontFamily: "sans-serif" }}>Đội Sinh viên tình nguyện Hải Dương</span>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--primary-red)", lineHeight: "1.2", fontFamily: "sans-serif" }}>tại Đại học Quốc gia Hà Nội</span>
                </div>
              </div>

              {/* Right Brand: Doan Xa */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <img src={logoDoanXaBase64 || logoDoanXaUrl} alt="Logo Đoàn" style={{ width: "45px", height: "45px", objectFit: "contain" }} />
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--primary-red)", fontFamily: "sans-serif" }}>Đoàn Xã Tứ Kỳ</span>
              </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem 0", position: "relative" }}>
              {/* Watermark Lotus Logo in Center */}
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

                {/* Grave Location details */}
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

                {/* Biography Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.85rem", maxWidth: "480px", margin: "0 auto" }}>
                  <div><strong>Năm sinh:</strong> {martyr.birth_year || "Chưa rõ"}</div>
                  <div><strong>Nhập ngũ:</strong> {martyr.enlistment_date || "Chưa rõ"}</div>
                  <div><strong>Cấp bậc:</strong> {martyr.rank || "Chưa rõ"}</div>
                  <div><strong>Đơn vị:</strong> {martyr.unit || "Chưa rõ"}</div>
                  <div style={{ gridColumn: "span 2" }}><strong>Ngày hy sinh:</strong> {martyr.death_date || "Chưa rõ"}</div>
                  <div style={{ gridColumn: "span 2" }}><strong>Quê quán:</strong> {martyr.hometown || "Chưa rõ"}</div>
                </div>
              </div>
            </div>

            {/* Footer of the Card */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #EADFCE", paddingTop: "1rem", width: "100%", zIndex: 1 }}>
              {/* QR Code */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "6px", borderRadius: "6px", border: "1px solid #EADFCE" }}>
                  <QRCodeSVG
                    value={shareUrl}
                    size={65}
                    bgColor={"#FFFFFF"}
                    fgColor={"#9B1C26"}
                    level={"M"}
                    includeMargin={false}
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

              {/* Commemoration Signature */}
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
        </div>
      </div>
    </>
  );
}
