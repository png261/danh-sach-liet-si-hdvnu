"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Howl } from "howler";
import { ArrowRight, Play, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import Masonry from "react-masonry-css";


import { CloudDivider } from "@/app/components/VietnameseMotifs";

interface ProjectIntroProps {
  onEnterSearch: () => void;
  startAnimation?: boolean;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const wordVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] as const }
  }
};

function CinematicText({ text, style, className, animate = "visible", delay = 0 }: { text: string; style?: React.CSSProperties; className?: string; animate?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <motion.span
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: delay }
        }
      }}
      initial="hidden"
      animate={animate}
      style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", ...style }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function ProjectIntro({ onEnterSearch, startAnimation = true }: ProjectIntroProps) {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // InView hooks for scroll-triggered animations
  const [gallerySectionRef, gallerySectionInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [footerRef, footerInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  

  useEffect(() => {
    const sound = new Howl({
      src: ["https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/intro_bgm.mp3"],
      html5: false,
      loop: true,
      volume: 0
    });

    const tryPlay = () => {
      if (sound.state() === "unloaded") {
        sound.load();
      }
      if (!sound.playing()) {
        sound.play();
        sound.fade(sound.volume(), 0.55, 2000);
      }
    };

    tryPlay();

    const handleInteraction = () => {
      tryPlay();
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
    };

    if (!sound.playing()) {
      window.addEventListener("click", handleInteraction);
      window.addEventListener("touchstart", handleInteraction);
      window.addEventListener("mousedown", handleInteraction);
      window.addEventListener("keydown", handleInteraction);
      window.addEventListener("pointerdown", handleInteraction);
    }

    return () => {
      removeListeners();
      sound.unload();
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
            <Image src="/logo_svtn.webp" alt="Logo Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội" className="intro-logo-img" width={60} height={60} style={{ objectFit: "contain", flexShrink: 0 }} />
            <div className="intro-badge-text" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-red)", letterSpacing: "0.02em", lineHeight: "1.2" }}>Đội Sinh viên tình nguyện Hải Dương</span>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--primary-red)", letterSpacing: "0.02em", lineHeight: "1.2" }}>tại Đại học Quốc gia Hà Nội</span>
            </div>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Image src="/logo_doan_xa.webp" alt="Logo Đoàn xã" className="intro-logo-img" width={60} height={60} style={{ objectFit: "contain", flexShrink: 0 }} />
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
          className="font-serif"
          style={{ 
            fontSize: "clamp(1.6rem, 6vw, 3.8rem)", 
            lineHeight: "1.25", 
            letterSpacing: "-1px", 
            color: "var(--foreground)", 
            fontWeight: "normal",
            maxWidth: "900px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.2rem"
          }}
        >
          <CinematicText 
            text="Cổng thông tin tra cứu" 
            animate={startAnimation ? "visible" : "hidden"}
          />
          <CinematicText 
            text="liệt sĩ xã Tứ Kỳ" 
            animate={startAnimation ? "visible" : "hidden"}
            delay={0.32} // Bắt đầu chạy sau khi dòng thứ nhất kết thúc
          />
        </h1>

        {/* Subtext description */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={startAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          style={{ 
            fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)", 
            color: "var(--text-muted)", 
            maxWidth: "680px", 
            marginTop: "1.8rem", 
            lineHeight: "1.7",
            fontWeight: "300"
          }}
        >
          Công trình thanh niên số hóa bản đồ các nghĩa trang liệt sĩ tại xã Tứ Kỳ (bao gồm các xã Tứ Kỳ, Minh Đức, Quang Khải và Quang Phục) thực hiện bởi Đội sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội phối hợp cùng Đoàn xã Tứ Kỳ. Nơi tri ân công ơn trời biển, lưu giữ ngàn năm ký ức về các anh hùng liệt sĩ.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={startAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
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
        </motion.div>

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
        <motion.div
          ref={gallerySectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={gallerySectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
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
        </motion.div>

        {/* Masonry Gallery */}
        <Masonry
          breakpointCols={{ default: 3, 1024: 3, 768: 2, 480: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid-col"
        >
          {galleryImages.map((img, index) => (
            <motion.div
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={gallerySectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                backgroundColor: "#FFF",
                border: "1px solid #EADFCE",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                marginBottom: "1rem",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(164, 123, 46, 0.14)" }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={300}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="masonry-img"
              />
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
                padding: "2rem 0.9rem 0.75rem",
                color: "#FFF",
              }}>
                <span style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                  display: "block",
                }}>
                  {img.title}
                </span>
              </div>
            </motion.div>
          ))}
        </Masonry>
      </section>

      {/* Lightbox Modal */}
      <Lightbox
        open={selectedImageIndex !== null}
        close={() => setSelectedImageIndex(null)}
        index={selectedImageIndex ?? 0}
        slides={galleryImages.map(img => ({
          src: img.src,
          alt: img.alt,
          title: img.title
        }))}
        plugins={[Captions]}
        captions={{
          descriptionTextAlign: "center"
        }}
      />

      {/* Footer */}
      <motion.footer
        ref={footerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={footerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: "easeOut" }} 
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
            <Image src="/logo_svtn.webp" alt="Logo Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội" width={54} height={54} style={{ objectFit: "contain" }} />
          </a>
          <Image src="/logo_doan_xa.webp" alt="Logo Đoàn xã Tứ Kỳ" width={54} height={54} style={{ objectFit: "contain" }} />
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
      </motion.footer>
    </div>
  );
}
