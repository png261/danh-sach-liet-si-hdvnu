"use client";

import { useRef, useEffect, useState } from "react";
import { ArrowRight, Play, Heart, Users, Calendar, CheckCircle, Award, MapPin, Database, QrCode, Flame, Flag } from "lucide-react";

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

interface DayActivity {
  day: number;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  icon: React.ReactNode;
  tasks: string[];
  highlight?: string;
  isProjectDay?: boolean;
}

const days: DayActivity[] = [
  {
    day: 1,
    title: "Lễ Ra Quân & Hành Quân",
    subtitle: "Xuất kích về xã Tứ Kỳ",
    image: "/real_tu_ky.webp",
    imageAlt: "Quang cảnh xã Tứ Kỳ, huyện Tứ Kỳ, tỉnh Hải Dương",
    icon: <Flag size={16} />,
    tasks: [
      "Tập hợp toàn đội hình tại Hà Nội, di chuyển về địa bàn xã Tứ Kỳ",
      "Tổ chức lễ ra quân chiến dịch Mùa hè xanh 2026",
      "Họp bàn giao nhiệm vụ với lãnh đạo Đoàn xã Tứ Kỳ",
      "Phân chia khu vực đóng quân và thống nhất lịch công tác 7 ngày",
    ],
  },
  {
    day: 2,
    title: "Khảo Sát Thực Địa",
    subtitle: "Thu thập dữ liệu gốc",
    image: "/real_quang_khai.webp",
    imageAlt: "Nghĩa trang liệt sĩ xã Quang Khải, huyện Tứ Kỳ",
    icon: <MapPin size={16} />,
    tasks: [
      "Ra quân tại cả 4 nghĩa trang: Tứ Kỳ, Minh Đức, Quang Khải, Quang Phục",
      "Định vị GPS và chụp ảnh sơ đồ tổng thể khuôn viên từng nghĩa trang",
      "Ghi chép thủ công thông tin chi tiết từ tất cả bia mộ liệt sĩ",
      "Đối chiếu với sổ danh bạ liệt sĩ tại Văn phòng UBND xã Tứ Kỳ",
    ],
  },
  {
    day: 3,
    title: "Chỉnh Trang Nghĩa Trang",
    subtitle: "Tri ân bằng hành động",
    image: "/activity_don_dep.webp",
    imageAlt: "Đội sinh viên tình nguyện dọn dẹp, chỉnh trang nghĩa trang liệt sĩ",
    icon: <Heart size={16} />,
    tasks: [
      "Quét dọn lá khô, nhổ cỏ hoang trên toàn bộ khuôn viên nghĩa trang",
      "Lau sạch hàng trăm bia mộ liệt sĩ, bổ sung thông tin còn thiếu",
      "Sơn sửa, chỉnh trang hàng rào và lối đi trong nghĩa trang",
      "Chuẩn bị không gian trang nghiêm, sạch đẹp cho Lễ dâng hương",
    ],
  },
  {
    day: 4,
    title: "Xây Dựng Bản Đồ Số",
    subtitle: "Số hóa dữ liệu liệt sĩ",
    image: "/grave_illustration.webp",
    imageAlt: "Sơ đồ bản đồ nghĩa trang liệt sĩ được số hóa",
    icon: <Database size={16} />,
    tasks: [
      "Thiết kế cấu trúc cơ sở dữ liệu tên, năm sinh, quê quán liệt sĩ",
      "Vẽ và số hóa sơ đồ vị trí các phần mộ trong từng nghĩa trang",
      "Tích hợp tọa độ bản đồ và phát triển giao diện tra cứu bản đồ tương tác",
      "Nhập liệu kiểm tra chéo hơn 1.000 hồ sơ thông tin liệt sĩ",
    ],
    highlight: "Ngày cốt lõi của dự án — Công trình thanh niên Website tra cứu liệt sĩ được xây dựng trực tiếp từ dữ liệu này.",
    isProjectDay: true,
  },
  {
    day: 5,
    title: "Lắp Đặt Bảng Mã QR",
    subtitle: "Chuyển đổi số cộng đồng",
    image: "/activity_dung_qr.webp",
    imageAlt: "Lắp đặt bảng tra cứu mã QR tại cổng nghĩa trang liệt sĩ",
    icon: <QrCode size={16} />,
    tasks: [
      "Thiết kế và chế tác bảng gỗ lắp mã QR kích thước lớn",
      "Lắp đặt bảng QR tại cổng chính các nghĩa trang Tứ Kỳ, Quang Khải, Quang Phục",
      "Hướng dẫn người dân quét mã QR và tra cứu thông tin trực tiếp bằng điện thoại",
      "Kiểm tra kết nối, tốc độ tra cứu và tính ổn định của hệ thống ngoài thực địa",
    ],
    highlight: "Người dân và thân nhân liệt sĩ có thể ngay lập tức tìm mộ bằng điện thoại thông minh.",
    isProjectDay: true,
  },
  {
    day: 6,
    title: "Lễ Dâng Hương & Thắp Nến",
    subtitle: "Đêm tri ân ấm cúng",
    image: "/activity_doan_vien.webp",
    imageAlt: "Lễ dâng hương và thắp nến tri ân các anh hùng liệt sĩ",
    icon: <Flame size={16} />,
    tasks: [
      "Tổ chức lễ dâng hương trang trọng trước đài tưởng niệm liệt sĩ xã Tứ Kỳ",
      "Thắp nến tri ân lên từng ngôi mộ liệt sĩ trong đêm khuya tĩnh lặng",
      "Mời các cụ cựu chiến binh và gia đình liệt sĩ cùng tham dự lễ",
      "Giao lưu văn nghệ và chia sẻ câu chuyện về những người đã hi sinh",
    ],
  },
  {
    day: 7,
    title: "Bàn Giao Công Trình Thanh Niên",
    subtitle: "Kết thúc chiến dịch Mùa hè xanh",
    image: "/real_quang_phuc.webp",
    imageAlt: "Nghĩa trang liệt sĩ xã Quang Phục sau khi hoàn thành chiến dịch",
    icon: <Award size={16} />,
    tasks: [
      "Tổ chức lễ bàn giao chính thức Cổng tra cứu thông tin liệt sĩ cho UBND xã Tứ Kỳ",
      "Nghiệm thu Công trình thanh niên cùng Huyện đoàn Tứ Kỳ và Đoàn xã",
      "Tổng kết kết quả 7 ngày chiến dịch Mùa hè xanh 2026",
      "Tạm biệt bà con nhân dân và kết thúc hành trình ý nghĩa tại quê hương",
    ],
    highlight: "Website tra cứu liệt sĩ được bàn giao chính thức — Công trình thanh niên số hóa phi lợi nhuận phục vụ cộng đồng mãi mãi.",
    isProjectDay: true,
  },
];

export default function ProjectIntro({ onEnterSearch }: ProjectIntroProps) {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const scrollToGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDayChange = (day: number) => {
    if (day === activeDay) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveDay(day);
      setIsTransitioning(false);
    }, 200);
  };

  const currentDay = days.find(d => d.day === activeDay)!;

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

      {/* Hero Section */}
      <section 
        className="intro-hero"
        style={{ 
          position: "relative", 
          zIndex: 10, 
          maxWidth: "1000px", 
          margin: "0 auto", 
          padding: "6rem 1.25rem 4rem", 
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
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)", 
              fontWeight: "normal", 
              color: "var(--foreground)", 
              marginTop: "0.5rem",
              lineHeight: "1.2"
            }}
          >
            7 ngày hành trình ý nghĩa
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.6rem", maxWidth: "560px", margin: "0.6rem auto 0" }}>
            Hành trình 7 ngày chiến dịch Mùa hè xanh tại xã Tứ Kỳ — từ khảo sát thực địa đến bàn giao Công trình thanh niên số hóa.
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div 
          className="day-tabs-scroll"
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "1rem",
            scrollbarWidth: "none",
            marginBottom: "2rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {days.map((d) => (
            <button
              key={d.day}
              onClick={() => handleDayChange(d.day)}
              className={`day-tab-btn${activeDay === d.day ? " active" : ""}${d.isProjectDay ? " project-day" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.6rem 1rem",
                borderRadius: "14px",
                border: activeDay === d.day 
                  ? `2px solid ${d.isProjectDay ? "var(--gold)" : "var(--primary-red)"}`
                  : "2px solid transparent",
                background: activeDay === d.day 
                  ? (d.isProjectDay 
                      ? "linear-gradient(135deg, rgba(164,123,46,0.15), rgba(164,123,46,0.05))"
                      : "linear-gradient(135deg, rgba(155,28,38,0.10), rgba(155,28,38,0.03))")
                  : "rgba(255,255,255,0.6)",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                backdropFilter: "blur(8px)",
                minWidth: "80px",
                flexShrink: 0,
                boxShadow: activeDay === d.day ? "0 4px 14px rgba(0,0,0,0.08)" : "none",
              }}
              aria-label={`Ngày ${d.day}: ${d.title}`}
            >
              <span style={{ 
                fontSize: "0.65rem", 
                fontWeight: 700, 
                color: activeDay === d.day 
                  ? (d.isProjectDay ? "var(--gold)" : "var(--primary-red)")
                  : "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                transition: "color 0.2s"
              }}>
                Ngày {d.day}
              </span>
              <span style={{ 
                display: "flex",
                color: activeDay === d.day 
                  ? (d.isProjectDay ? "var(--gold)" : "var(--primary-red)")
                  : "#9CA3AF",
                transition: "color 0.2s"
              }}>
                {d.icon}
              </span>
              {d.isProjectDay && (
                <span style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "var(--gold)",
                  flexShrink: 0,
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Day Detail Card */}
        <div
          className="day-detail-card"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            background: "#FFFFFF",
            borderRadius: "24px",
            border: currentDay.isProjectDay ? "1.5px solid var(--gold)" : "1.5px solid #EADFCE",
            overflow: "hidden",
            boxShadow: currentDay.isProjectDay 
              ? "0 8px 40px rgba(164, 123, 46, 0.12), 0 2px 8px rgba(0,0,0,0.04)"
              : "0 8px 40px rgba(0,0,0,0.05)",
          }}
        >
          <div
            className="day-detail-inner"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              height: "420px",
            }}
          >
            {/* Left: Image */}
            <div style={{ position: "relative", overflow: "hidden", height: "420px" }}>
              <img
                src={currentDay.image}
                alt={currentDay.imageAlt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "block",
                }}
                className="day-detail-img"
              />
              {/* Day badge overlay */}
              <div style={{
                position: "absolute",
                top: "1.25rem",
                left: "1.25rem",
                background: currentDay.isProjectDay 
                  ? "linear-gradient(135deg, var(--gold), #C59C45)" 
                  : "linear-gradient(135deg, var(--primary-red), #7B1020)",
                color: "#FFF",
                borderRadius: "12px",
                padding: "0.4rem 0.85rem",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}>
                {currentDay.icon}
                Ngày {currentDay.day}
              </div>
            </div>

            {/* Right: Content */}
            <div style={{ 
              padding: "2.5rem", 
              display: "flex", 
              flexDirection: "column",
              justifyContent: "space-between",
              height: "420px",
              overflowY: "auto",
            }}>
              <div>
                <div style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: currentDay.isProjectDay ? "var(--gold)" : "var(--primary-red)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.4rem",
                }}>
                  {currentDay.subtitle}
                </div>
                <h3 
                  className="font-serif" 
                  style={{ 
                    fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", 
                    color: "var(--foreground)", 
                    marginBottom: "1.5rem",
                    lineHeight: "1.25",
                    fontWeight: "normal",
                  }}
                >
                  {currentDay.title}
                </h3>

                {/* Task List */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {currentDay.tasks.map((task, i) => (
                    <li key={i} style={{ 
                      display: "flex", 
                      gap: "0.7rem", 
                      alignItems: "flex-start",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.55",
                    }}>
                      <CheckCircle 
                        size={15} 
                        style={{ 
                          color: currentDay.isProjectDay ? "var(--gold)" : "var(--primary-red)",
                          flexShrink: 0, 
                          marginTop: "2px" 
                        }} 
                        fill={currentDay.isProjectDay ? "rgba(164,123,46,0.12)" : "rgba(155,28,38,0.10)"}
                      />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Project Highlight */}
              {currentDay.highlight && (
                <div style={{
                  marginTop: "1.5rem",
                  padding: "1rem 1.2rem",
                  background: currentDay.isProjectDay 
                    ? "linear-gradient(135deg, rgba(164,123,46,0.1), rgba(164,123,46,0.04))" 
                    : "linear-gradient(135deg, rgba(155,28,38,0.07), rgba(155,28,38,0.02))",
                  borderRadius: "12px",
                  border: currentDay.isProjectDay ? "1px solid rgba(164,123,46,0.25)" : "1px solid rgba(155,28,38,0.15)",
                  display: "flex",
                  gap: "0.6rem",
                  alignItems: "flex-start",
                }}>
                  <Award 
                    size={15} 
                    style={{ 
                      color: currentDay.isProjectDay ? "var(--gold)" : "var(--primary-red)",
                      flexShrink: 0,
                      marginTop: "1px"
                    }} 
                  />
                  <p style={{ 
                    fontSize: "0.8rem", 
                    color: currentDay.isProjectDay ? "var(--gold)" : "var(--primary-red)",
                    lineHeight: "1.55",
                    margin: 0,
                    fontWeight: 600,
                  }}>
                    {currentDay.highlight}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day dots nav */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          {days.map(d => (
            <button
              key={d.day}
              onClick={() => handleDayChange(d.day)}
              aria-label={`Chuyển sang Ngày ${d.day}`}
              style={{
                width: activeDay === d.day ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: activeDay === d.day 
                  ? (d.isProjectDay ? "var(--gold)" : "var(--primary-red)")
                  : "#D1C8BA",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

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
