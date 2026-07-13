"use client";

import { useRef, useEffect } from "react";
import { ArrowRight, Play, Heart, Users, Calendar } from "lucide-react";
import { CloudDivider } from "@/app/components/VietnameseMotifs";

interface ProjectIntroProps {
  onEnterSearch: () => void;
}

export default function ProjectIntro({ onEnterSearch }: ProjectIntroProps) {
  const galleryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const audio = new Audio("https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/intro_bgm.mp3");
    audio.loop = true;
    audio.volume = 0;
    
    let fadeInterval: NodeJS.Timeout;
    const duration = 2000; // 2 seconds
    const step = 50; // step in ms
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

    // First attempt to play
    audio.play()
      .then(() => {
        startFadeIn();
      })
      .catch(() => {
        // Blocked - wait for interaction
        addListeners();
      });

    return () => {
      removeListeners();
      clearInterval(fadeInterval);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const scrollToGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
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
      {/* 1. Cinematic Background Video Layer (Aethera-inspired) */}
      <div 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "90vh", 
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
            opacity: 0.28, // Soft ambient blending
            mixBlendMode: "multiply"
          }}
        />
        {/* Soft fading overlays */}
        <div 
          style={{ 
            position: "absolute", 
            inset: 0, 
            background: "linear-gradient(to bottom, rgba(250, 248, 242, 0.1) 0%, rgba(250, 248, 242, 0.4) 60%, var(--background) 100%)" 
          }} 
        />
      </div>

      <header 
        className="intro-header"
        style={{ 
          position: "relative", 
          zIndex: 10, 
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
        {/* Action pills & badges with logo images */}
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
            <img src="/logo_svtn.webp" alt="Logo Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội" style={{ height: "38px", width: "38px", objectFit: "contain", flexShrink: 0 }} />
            <div className="intro-badge-text" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-red)", letterSpacing: "0.02em", lineHeight: "1.2" }}>Đội Sinh viên tình nguyện Hải Dương</span>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--primary-red)", letterSpacing: "0.02em", lineHeight: "1.2" }}>tại Đại học Quốc gia Hà Nội</span>
            </div>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <img src="/logo_doan_xa.webp" alt="Logo Đoàn xã" style={{ height: "38px", width: "38px", objectFit: "contain", flexShrink: 0 }} />
            <span className="intro-badge-text" style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-red)", letterSpacing: "0.02em" }}>Đoàn Xã Tứ Kỳ</span>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Aethera-inspired copywriting & layout) */}
      <section 
        className="intro-hero"
        style={{ 
          position: "relative", 
          zIndex: 10, 
          maxWidth: "1000px", 
          margin: "0 auto", 
          padding: "4rem 1.25rem 4rem", 
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >

        {/* Animated Poetic Headline */}
        <h1 
          className="font-serif animate-fade-rise"
          style={{ 
            fontSize: "clamp(2rem, 7vw, 4.5rem)", 
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
            fontSize: "clamp(0.95rem, 2vw, 1.12rem)", 
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
            <Play size={14} fill="currentColor" /> Hình ảnh hoạt động
          </a>
        </div>

        <div style={{ marginTop: "4rem", width: "160px" }}>
          <CloudDivider />
        </div>
      </section>

      {/* 4. Gallery Section (Smooth scroll target) */}
      <section 
        id="activities-gallery"
        ref={galleryRef}
        style={{ 
          position: "relative", 
          zIndex: 10, 
          maxWidth: "1100px", 
          margin: "0 auto", 
          padding: "5rem 1.5rem 8rem"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
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
            <Heart size={12} fill="var(--primary-red)" /> HÌNH ẢNH HOẠT ĐỘNG DỰ ÁN
          </span>
          <h2 
            className="font-serif"
            style={{ 
              fontSize: "2.4rem", 
              fontWeight: "normal", 
              color: "var(--foreground)", 
              marginTop: "0.5rem" 
            }}
          >
            Hành trình ý nghĩa & tri ân
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem", maxWidth: "600px", margin: "0.5rem auto 0" }}>
            Công trình thanh niên do Đoàn TNCS Hồ Chí Minh xã Tứ Kỳ phối hợp cùng Đội sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội thực hiện.
          </p>
        </div>

        {/* Dynamic Card Layout */}
        <div 
          className="intro-cards-grid"
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
            gap: "1.5rem" 
          }}
        >
          {/* Card 1 */}
          <div 
            className="activity-card-aethera"
            style={{ 
              border: "1px solid #EADFCE", 
              borderRadius: "16px", 
              background: "#FFFFFF", 
              overflow: "hidden", 
              boxShadow: "0 4px 20px rgba(164,123,46,0.02)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <div style={{ height: "230px", overflow: "hidden", position: "relative" }}>
              <img 
                src="/activity_don_dep.webp" 
                alt="Chỉnh trang lau dọn nghĩa trang"
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                className="activity-img"
              />
            </div>
            <div style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gold)", fontSize: "0.78rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                <Calendar size={12} /> Đợt hoạt động hè 2026
              </div>
              <h3 className="font-serif" style={{ fontSize: "1.35rem", color: "var(--foreground)", marginBottom: "0.75rem" }}>
                Dọn dẹp & chỉnh trang nghĩa trang
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.65" }}>
                Tổ chức quét dọn thực địa, dọn cỏ hoang và lau chùi sạch sẽ toàn bộ các phần mộ liệt sĩ. Góp phần trả lại cảnh quan trang nghiêm, sạch đẹp tôn nghiêm.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div 
            className="activity-card-aethera"
            style={{ 
              border: "1px solid #EADFCE", 
              borderRadius: "16px", 
              background: "#FFFFFF", 
              overflow: "hidden", 
              boxShadow: "0 4px 20px rgba(164,123,46,0.02)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <div style={{ height: "230px", overflow: "hidden", position: "relative" }}>
              <img 
                src="/activity_dung_qr.webp" 
                alt="Lắp đặt dựng biển tra cứu mã QR"
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                className="activity-img"
              />
            </div>
            <div style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gold)", fontSize: "0.78rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                <Users size={12} /> Hoạt động thực địa
              </div>
              <h3 className="font-serif" style={{ fontSize: "1.35rem", color: "var(--foreground)", marginBottom: "0.75rem" }}>
                Dựng biển tra cứu mã QR
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.65" }}>
                Thiết kế, chế tác bảng gỗ và lắp đặt các biển quét mã QR tra cứu lớn tại các lối đi chính. Người dân có thể nhanh chóng tra cứu vị trí phần mộ trực tiếp bằng điện thoại.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div 
            className="activity-card-aethera"
            style={{ 
              border: "1px solid #EADFCE", 
              borderRadius: "16px", 
              background: "#FFFFFF", 
              overflow: "hidden", 
              boxShadow: "0 4px 20px rgba(164,123,46,0.02)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <div style={{ height: "230px", overflow: "hidden", position: "relative" }}>
              <img 
                src="/activity_doan_vien.webp" 
                alt="Lễ dâng hương thắp nhang tri ân"
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                className="activity-img"
              />
            </div>
            <div style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gold)", fontSize: "0.78rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                <Heart size={12} fill="var(--gold)" /> Lễ tri ân
              </div>
              <h3 className="font-serif" style={{ fontSize: "1.35rem", color: "var(--foreground)", marginBottom: "0.75rem" }}>
                Dâng hương & thắp nhang tri ân
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.65" }}>
                Tổ chức lễ dâng hương thành kính trước tượng đài chính và thắp nén hương thơm tri ân lên từng ngôi mộ, thắt chặt mối quan hệ gắn bó tình nguyện giữa sinh viên và tuổi trẻ địa phương.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA below gallery */}
        <div style={{ marginTop: "5rem", textAlign: "center" }}>
          <button 
            onClick={onEnterSearch}
            className="btn btn-gold"
            style={{ 
              borderRadius: "30px",
              padding: "0.85rem 2.2rem",
              fontSize: "0.95rem",
              fontWeight: "600",
              boxShadow: "0 10px 25px rgba(164, 123, 46, 0.18)"
            }}
          >
            Tra cứu phần mộ liệt sĩ <ArrowRight size={16} style={{ marginLeft: "0.4rem" }} />
          </button>
        </div>
      </section>

      {/* 5. Footer info */}
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
          Dự án số hóa cộng đồng phi lợi nhuận • Đoàn xã Tứ Kỳ & Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội • 2026
        </p>
      </footer>
    </div>
  );
}
