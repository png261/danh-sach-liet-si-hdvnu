"use client";

import { useRef, useEffect, useState } from "react";
import { ArrowRight, Play, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const FacebookIcon = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.96-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);
import { CloudDivider } from "@/app/components/VietnameseMotifs";

interface ProjectIntroProps {
  onEnterSearch: () => void;
}

interface GalleryImage {
  src: string;
  alt: string;
  title: string;
}

const galleryImages: GalleryImage[] = [
  { src: "/real_tu_ky.webp", alt: "Lễ Ra Quân & Hành Quân - Ngày 1", title: "Ngày 1: Lễ Ra Quân & Hành Quân" },
  { src: "/real_quang_khai.webp", alt: "Khảo Sát Thực Địa - Ngày 2", title: "Ngày 2: Khảo Sát Thực Địa" },
  { src: "/activity_don_dep.webp", alt: "Chỉnh Trang Nghĩa Trang - Ngày 3", title: "Ngày 3: Chỉnh Trang Nghĩa Trang" },
  { src: "/grave_illustration.webp", alt: "Xây Dựng Bản Đồ Số - Ngày 4", title: "Ngày 4: Xây Dựng Bản Đồ Số" },
  { src: "/activity_dung_qr.webp", alt: "Lắp Đặt Bảng Mã QR - Ngày 5", title: "Ngày 5: Lắp Đặt Bảng Mã QR" },
  { src: "/activity_doan_vien.webp", alt: "Lễ Dâng Hương & Thắp Nến - Ngày 6", title: "Ngày 6: Lễ Dâng Hương & Thắp Nến" },
  { src: "/real_quang_phuc.webp", alt: "Bàn Giao Công Trình - Ngày 7", title: "Ngày 7: Bàn Giao Công Trình" },
  { src: "/real_minh_duc.webp", alt: "Nghĩa trang liệt sĩ xã Minh Đức", title: "Nghĩa trang liệt sĩ xã Minh Đức" },
  { src: "/monument_tu_ky.webp", alt: "Đài tưởng niệm nghĩa trang liệt sĩ Tứ Kỳ", title: "Đài tưởng niệm Tứ Kỳ" },
  { src: "/monument_quang_khai.webp", alt: "Đài tưởng niệm nghĩa trang liệt sĩ Quang Khải", title: "Đài tưởng niệm Quang Khải" },
  { src: "/monument_quang_phuc.webp", alt: "Đài tưởng niệm nghĩa trang liệt sĩ Quang Phục", title: "Đài tưởng niệm Quang Phục" },
  { src: "/monument_minh_duc.webp", alt: "Đài tưởng niệm nghĩa trang liệt sĩ Minh Đức", title: "Đài tưởng niệm Minh Đức" },
  { src: "/pavilion_tu_ky.webp", alt: "Khuôn viên nghĩa trang Tứ Kỳ", title: "Khuôn viên nghĩa trang Tứ Kỳ" },
  { src: "/gate_cemetery.webp", alt: "Cổng nghĩa trang Tứ Kỳ", title: "Cổng nghĩa trang Tứ Kỳ" },
  { src: "/gate_quang_khai.webp", alt: "Cổng nghĩa trang Quang Khải", title: "Cổng nghĩa trang Quang Khải" },
  { src: "/gate_quang_phuc.webp", alt: "Cổng nghĩa trang Quang Phục", title: "Cổng nghĩa trang Quang Phục" },
];

export default function ProjectIntro({ onEnterSearch }: ProjectIntroProps) {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const audio = new Audio("https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/intro_bgm.mp3");
    audio.loop = true;
    audio.volume = 0;
    
    let fadeInterval: NodeJS.Timeout;
    const duration = 2000;
    const step = 50;
    const targetVolume = 0.55; 
    const volumeIncrement = targetVolume / (duration / step);

    const startFadeIn = () => {
      clearInterval(fadeInterval);
      fadeInterval = setInterval(() => {
        if (audio.volume < targetVolume) {
          audio.volume = Math.min(targetVolume, audio.volume + volumeIncrement);
        } else {
          clearInterval(fadeInterval);
        }
      }, step);
    };

    const tryPlay = () => {
      audio.play()
        .then(() => {
          startFadeIn();
          removeListeners();
        })
        .catch((err) => {
          console.log("Audio play blocked, waiting for interaction:", err);
        });
    };

    const handleInteraction = () => {
      tryPlay();
    };

    const addListeners = () => {
      window.addEventListener("click", handleInteraction);
      window.addEventListener("touchstart", handleInteraction);
    };

    const removeListeners = () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    audio.play()
      .then(() => {
        startFadeIn();
      })
      .catch(() => {
        addListeners();
      });

    return () => {
      removeListeners();
      clearInterval(fadeInterval);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "Escape") setSelectedImageIndex(null);
      if (e.key === "ArrowLeft") {
        setSelectedImageIndex(prev => prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null);
      }
      if (e.key === "ArrowRight") {
        setSelectedImageIndex(prev => prev !== null ? (prev + 1) % galleryImages.length : null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex]);

  const scrollToGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
    }
  };

  return (
    <div 
      className="about-page-container" 
      style={{ 
        backgroundColor: "var(--background)", 
        minHeight: "100vh", 
        position: "relative", 
        overflowX: "hidden" 
      }}
    >
      {/* Cinematic Background Video Layer */}
      <div 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100vh", 
          overflow: "hidden", 
          zIndex: 0,
          pointerEvents: "none"
        }}
      >
        <video 
          src="https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/intro_bg_video.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            opacity: 0.28,
            mixBlendMode: "multiply"
          }}
        />
        <div 
          style={{ 
            position: "absolute", 
            inset: 0, 
            background: "linear-gradient(to bottom, rgba(250, 248, 242, 0.1) 0%, rgba(250, 248, 242, 0.4) 60%, var(--background) 100%)" 
          }} 
        />
      </div>

      {/* Header */}
      <header 
        className="intro-header"
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0,
          zIndex: 1, 
          maxWidth: "1200px", 
          margin: "0 auto", 
          padding: "1.25rem 1.25rem", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}
      >
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
          className="nav-badges"
        >
          <a 
            href="https://www.facebook.com/svtnhaiduong.vnu" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", cursor: "pointer", transition: "transform 0.2s" }} 
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <img src="/logo_svtn.webp" alt="Logo Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội" className="intro-logo-img" style={{ height: "60px", width: "60px", objectFit: "contain", flexShrink: 0 }} />
            <div className="intro-badge-text" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-red)", letterSpacing: "0.02em", lineHeight: "1.2" }}>Đội Sinh viên tình nguyện Hải Dương</span>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--primary-red)", letterSpacing: "0.02em", lineHeight: "1.2" }}>tại Đại học Quốc gia Hà Nội</span>
            </div>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <img src="/logo_doan_xa.webp" alt="Logo Đoàn xã" className="intro-logo-img" style={{ height: "60px", width: "60px", objectFit: "contain", flexShrink: 0 }} />
            <span className="intro-badge-text" style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-red)", letterSpacing: "0.02em" }}>Đoàn Xã Tứ Kỳ</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="intro-hero"
        style={{ 
          position: "relative", 
          zIndex: 10, 
          maxWidth: "1000px", 
          margin: "0 auto", 
          padding: "8.5rem 1.25rem 4rem", 
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh"
        }}
      >
        {/* Animated Poetic Headline */}
        <h1 
          className="font-serif animate-fade-rise"
          style={{ 
            fontSize: "clamp(1.6rem, 6vw, 3.8rem)", 
            lineHeight: "1.1", 
            letterSpacing: "-1px", 
            color: "var(--foreground)", 
            fontWeight: "normal",
            maxWidth: "900px"
          }}
        >
          Cổng tra cứu thông tin liệt sĩ xã Tứ Kỳ
        </h1>

        {/* Subtext description */}
        <p 
          className="animate-fade-rise-delay-1"
          style={{ 
            fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)", 
            color: "var(--text-muted)", 
            maxWidth: "680px", 
            marginTop: "1.8rem", 
            lineHeight: "1.7",
            fontWeight: "300"
          }}
        >
          Công trình thanh niên số hóa bản đồ các nghĩa trang liệt sĩ tại huyện Tứ Kỳ (bao gồm các xã Tứ Kỳ, Minh Đức, Quang Khải và Quang Phục) thực hiện bởi Đội sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội phối hợp cùng Đoàn xã Tứ Kỳ. Nơi tri ân công ơn trời biển, lưu giữ ngàn năm ký ức về các anh hùng liệt sĩ.
        </p>

        {/* Action Buttons */}
        <div 
          className="animate-fade-rise-delay-2"
          style={{ 
            marginTop: "2.5rem", 
            display: "flex", 
            flexWrap: "wrap",
            justifyContent: "center", 
            alignItems: "center", 
            gap: "1.25rem" 
          }}
        >
          <button 
            onClick={onEnterSearch}
            className="btn btn-gold"
            style={{ 
              borderRadius: "30px",
              padding: "0.9rem 2.2rem",
              fontSize: "0.95rem",
              fontWeight: "600",
              boxShadow: "0 10px 25px rgba(164, 123, 46, 0.18)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Tra cứu thông tin liệt sĩ <ArrowRight size={16} />
          </button>

          <a 
            href="#activities-gallery"
            onClick={scrollToGallery}
            style={{ 
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.6rem 1.2rem",
              borderRadius: "20px",
              transition: "all 0.2s ease"
            }}
            className="btn-ghost-hover"
          >
            <Play size={14} fill="currentColor" /> Hình ảnh 7 ngày hoạt động
          </a>
        </div>

        <div style={{ marginTop: "4rem", width: "160px" }}>
          <CloudDivider />
        </div>
      </section>

      {/* ====================== 7-DAY TIMELINE GALLERY ====================== */}
      <section 
        id="activities-gallery"
        ref={galleryRef}
        style={{ 
          position: "relative", 
          zIndex: 10, 
          maxWidth: "1100px", 
          margin: "0 auto", 
          padding: "5rem 1.5rem 2rem"
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span 
            style={{ 
              fontSize: "0.75rem", 
              fontWeight: 700, 
              color: "var(--primary-red)", 
              textTransform: "uppercase", 
              letterSpacing: "0.08em",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Calendar size={12} /> CHIẾN DỊCH MÙA HÈ XANH 2026
          </span>
          <h2 
            className="font-serif"
            style={{ 
              fontSize: "clamp(1.4rem, 3.5vw, 2.4rem)", 
              fontWeight: "normal", 
              color: "var(--foreground)", 
              marginTop: "0.5rem",
              lineHeight: "1.2"
            }}
          >
            Hình ảnh hành trình hoạt động
          </h2>
        </div>

        {/* Scrollable Gallery */}
        <div style={{ position: "relative" }}>
          {/* Subtle scroll/swipe indicator */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "0.75rem", 
            fontSize: "0.8rem", 
            color: "var(--text-muted)",
            padding: "0 0.25rem"
          }}>
            <span>Lướt qua trái/phải để xem ({galleryImages.length} ảnh)</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
              Lướt xem <ArrowRight size={12} />
            </span>
          </div>

          <div 
            className="gallery-scroll-container"
            style={{
              display: "flex",
              gap: "1rem",
              overflowX: "auto",
              paddingBottom: "1.5rem",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
            }}
          >
            {galleryImages.map((img, index) => (
              <div
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                style={{
                  flex: "0 0 auto",
                  width: "min(360px, 80vw)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                  backgroundColor: "#FFF",
                  border: "1px solid #EADFCE",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  scrollSnapAlign: "start",
                  aspectRatio: "1.5",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(164, 123, 46, 0.12)";
                  const imageEl = e.currentTarget.querySelector("img");
                  if (imageEl) imageEl.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.03)";
                  const imageEl = e.currentTarget.querySelector("img");
                  if (imageEl) imageEl.style.transform = "scale(1)";
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    display: "block",
                  }}
                />
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%)",
                  padding: "1.2rem 1rem 0.8rem",
                  color: "#FFF",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}>
                  <span style={{ 
                    fontSize: "0.85rem", 
                    fontWeight: 600, 
                    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                    letterSpacing: "0.01em"
                  }}>
                    {img.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div
          onClick={() => setSelectedImageIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            padding: "1rem",
            animation: "fade-in 0.25s ease-out",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              cursor: "pointer",
              transition: "background 0.2s",
              zIndex: 10001,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>

          {/* Prev button */}
          <button
            onClick={handlePrevImage}
            style={{
              position: "absolute",
              left: "1.5rem",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              cursor: "pointer",
              transition: "background 0.2s",
              zIndex: 10000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <img
              src={galleryImages[selectedImageIndex].src}
              alt={galleryImages[selectedImageIndex].alt}
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            />
            <div style={{ color: "#FFF", fontSize: "1rem", textAlign: "center", fontWeight: 500, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              {galleryImages[selectedImageIndex].title}
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={handleNextImage}
            style={{
              position: "absolute",
              right: "1.5rem",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              cursor: "pointer",
              transition: "background 0.2s",
              zIndex: 10000,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
            aria-label="Ảnh sau"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer 
        style={{ 
          borderTop: "1px dashed #EADFCE", 
          padding: "2.5rem 1.5rem", 
          textAlign: "center", 
          fontSize: "0.8rem", 
          color: "var(--primary-red)",
          position: "relative",
          zIndex: 10
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
          <a 
            href="https://www.facebook.com/svtnhaiduong.vnu" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ display: "inline-block", cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <img src="/logo_svtn.webp" alt="Logo Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội" style={{ height: "54px", width: "54px", objectFit: "contain" }} />
          </a>
          <img src="/logo_doan_xa.webp" alt="Logo Đoàn xã Tứ Kỳ" style={{ height: "54px", width: "54px", objectFit: "contain" }} />
        </div>
        <p style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Cổng thông tin tri ân anh hùng liệt sĩ trên địa bàn xã Tứ Kỳ
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.76rem", marginTop: "0.35rem" }}>
          Dự án số hóa cộng đồng phi lợi nhuận · Đoàn xã Tứ Kỳ &amp; Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội · 2026
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.76rem", marginTop: "0.5rem" }}>
          <a href="https://www.facebook.com/svtnhaiduong.vnu" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-red)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            Facebook: facebook.com/svtnhaiduong.vnu
          </a>
          {" · "}
          <a href="https://www.youtube.com/@svtnhaiduongvnu" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-red)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            YouTube: SVTN Hải Dương tại ĐHQGHN
          </a>
        </p>
      </footer>
    </div>
  );
}
