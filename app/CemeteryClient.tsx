"use client";
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, RotateCcw, MapPin, Calendar, Map, Info, ChevronLeft, ChevronRight, Crosshair, Activity, ArrowLeft, Filter, X, User, Grid } from "lucide-react";
import Link from "next/link";

import type { Martyr } from "@/app/types/martyr";
import { normalizeString, getPhysicalZone, getAvailableZones, groupMartyrsByRow, computeZoneCounts, isFuzzyNameMatch, getFuzzyScore } from "@/app/lib/martyrUtils";
import { LotusMotif, CloudDivider } from "@/app/components/VietnameseMotifs";
import ProjectIntro from "@/app/components/ProjectIntro";
import CemeteryDropdown from "@/app/components/CemeteryDropdown";
import { createClient } from "@/utils/supabase/client";
import MartyrModal from "@/app/components/MartyrModal";
import CemeterySelectionModal from "@/app/components/CemeterySelectionModal";
import BackgroundMusic from "@/app/components/BackgroundMusic";
import CemeteryMap from "@/app/components/CemeteryMap";
import MartyrBottomCard from "@/app/components/MartyrBottomCard";

const SLUG_TO_CEMETERY: Record<string, string> = {
  "tu-ky": "Nghĩa trang liệt sĩ Tứ Kỳ",
  "tu_ky": "Nghĩa trang liệt sĩ Tứ Kỳ",
  "minh-duc": "Nghĩa trang liệt sĩ Minh Đức",
  "minh_duc": "Nghĩa trang liệt sĩ Minh Đức",
  "quang-khai": "Nghĩa trang liệt sĩ Quang Khải",
  "quang_khai": "Nghĩa trang liệt sĩ Quang Khải",
  "quang-phuc": "Nghĩa trang liệt sĩ Quang Phục",
  "quang_phuc": "Nghĩa trang liệt sĩ Quang Phục",
};

const CEMETERY_TO_SLUG: Record<string, string> = {
  "Nghĩa trang liệt sĩ Tứ Kỳ": "tu-ky",
  "Nghĩa trang liệt sĩ Minh Đức": "minh-duc",
  "Nghĩa trang liệt sĩ Quang Khải": "quang-khai",
  "Nghĩa trang liệt sĩ Quang Phục": "quang-phuc",
};

interface CemeteryClientProps {
  initialCemeterySlug?: string;
}

export default function CemeteryClient({ initialCemeterySlug }: CemeteryClientProps) {

  // ── Page Loader state ────────────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [pageFadeOut, setPageFadeOut] = useState(false);

  // ── Martyrs data (dynamically loaded) ────────────────────────────────────────
  const [martyrs, setMartyrs] = useState<Martyr[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [searchName,       setSearchName]       = useState("");
  const [searchHometown,   setSearchHometown]   = useState("");
  const [searchBirthYear,  setSearchBirthYear]  = useState("");
  const [selectedCemetery, setSelectedCemetery] = useState(() => SLUG_TO_CEMETERY[initialCemeterySlug?.toLowerCase() ?? ""] ?? "");
  const [selectedZone,     setSelectedZone]     = useState("");

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedMartyr,    setSelectedMartyr]    = useState<Martyr | null>(null);
  const [isModalOpen,       setIsModalOpen]       = useState(false);
  const [isBottomCardOpen,  setIsBottomCardOpen]  = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFilterModalOpen,    setIsFilterModalOpen]    = useState(false);
  const [isCemeteryModalOpen,  setIsCemeteryModalOpen]  = useState(false);
  const [quickSearch,          setQuickSearch]          = useState("");
  const [isQuickSearchFocused, setIsQuickSearchFocused] = useState(false);

  const graveGridRef = useRef<HTMLDivElement>(null);
  const quickSearchRef = useRef<HTMLDivElement>(null);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const zoneCounts = useMemo(() => computeZoneCounts(martyrs), [martyrs]);

  const availableZones = useMemo(
    () => getAvailableZones(selectedCemetery),
    [selectedCemetery]
  );

  const filteredMartyrs = useMemo(() => {
    const results = martyrs.filter((m) =>
      // Fuzzy match cho tên liệt sĩ: chịu sai dấu, sai thứ tự từ, sai chính tả nhẹ
      (!searchName      || isFuzzyNameMatch(m.name, searchName)) &&
      // Hometown vẫn dùng tìm kiếm chuỗi con đơn giản (địa danh ít khi bị gõ sai)
      (!searchHometown  || normalizeString(m.hometown).includes(normalizeString(searchHometown))) &&
      (!selectedZone    || getPhysicalZone(m) === selectedZone) &&
      (!searchBirthYear || m.birth_year?.includes(searchBirthYear))
    );

    // Sắp xếp theo độ liên quan: khớp chính xác hơn hiển thị trước
    if (searchName) {
      results.sort((a, b) => getFuzzyScore(b.name, searchName) - getFuzzyScore(a.name, searchName));
    }

    return results;
  }, [martyrs, searchName, searchHometown, selectedZone, searchBirthYear]);

  // Quick search suggestions (max 5) — dùng fuzzy search cho tên, sắp xếp theo độ liên quan
  const quickSearchSuggestions = useMemo(() => {
    if (!quickSearch || quickSearch.length < 2) return [];
    return martyrs
      .filter(m => isFuzzyNameMatch(m.name, quickSearch))
      .sort((a, b) => getFuzzyScore(b.name, quickSearch) - getFuzzyScore(a.name, quickSearch))
      .slice(0, 5);
  }, [quickSearch, martyrs]);

  const graveRows = useMemo(
    () => (selectedCemetery && selectedZone)
      ? groupMartyrsByRow(martyrs, selectedCemetery, selectedZone)
      : [],
    [martyrs, selectedCemetery, selectedZone]
  );

  // Click outside to close quick search suggestions
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickSearchRef.current && !quickSearchRef.current.contains(e.target as Node)) {
        setIsQuickSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Timer effect for page loader transition
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setPageFadeOut(true);
    }, 1100);

    const removeTimer = setTimeout(() => {
      setPageLoading(false);
    }, 1400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const renderLoader = () => {
    if (!pageLoading) return null;
    return (
      <div className={`page-loader-overlay${pageFadeOut ? " loader-fade-out" : ""}`}>
        <div className="loader-container">
          <div className="loader-logos">
            <div className="loader-logo-item">
              <img src="/logo_svtn.webp" alt="Logo Đội SVTN Hải Dương" className="loader-logo-img" />
              <span className="loader-logo-text">Đội SVTN Hải Dương tại ĐHQG Hà Nội</span>
            </div>
            <div className="loader-logo-item">
              <img src="/logo_doan_xa.webp" alt="Logo Đoàn xã Tứ Kỳ" className="loader-logo-img" />
              <span className="loader-logo-text">Đoàn xã Tứ Kỳ</span>
            </div>
          </div>
          
          {/* Elegant serif title */}
          <h2 className="loader-title font-serif">
            CỔNG TRA CỨU THÔNG TIN LIỆT SĨ
          </h2>
          
          {/* Spin traditional Vietnamese motif */}
          <div className="loader-spinner-wrapper">
            <img 
              src="https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets/trong_dong.svg" 
              alt="Trống đồng Đông Sơn" 
              width={120}
              height={120}
              className="loader-spin-star"
              style={{
                width: "120px",
                height: "120px",
                filter: "invert(53%) sepia(35%) saturate(1067%) hue-rotate(354deg) brightness(94%) contrast(92%)"
              }}
            />
          </div>
          
          {/* Dynamic bar loader */}
          <div className="loader-progress-container">
            <div className="loader-progress-line" />
          </div>
          <p className="loader-status-text">Đang kết nối dữ liệu tri ân...</p>
        </div>
      </div>
    );
  };

  const handleLocateMartyrGrave = (martyr: Martyr) => {
    setIsModalOpen(false);
    setSelectedCemetery(martyr.cemetery);
    setSelectedZone(getPhysicalZone(martyr));
    setSelectedMartyr(martyr);
    // Giữ Bottom Card mở để người dùng vẫn thấy thông tin ngôi mộ sau khi định vị
    setIsBottomCardOpen(true);
    setTimeout(() => graveGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const handleQuickSelect = useCallback((martyr: Martyr) => {
    setQuickSearch("");
    setIsQuickSearchFocused(false);
    handleLocateMartyrGrave(martyr);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Side effects ─────────────────────────────────────────────────────────────
  // Synchronize initial selection from URL pathname on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const segments = pathname.split("/").filter(Boolean);
      const cemParam = segments[segments.length - 1]?.toLowerCase();
      if (cemParam && SLUG_TO_CEMETERY[cemParam]) {
        setSelectedCemetery(SLUG_TO_CEMETERY[cemParam]);
      }
    }
  }, []);

  // Fetch martyrs data from Supabase when cemetery changes
  useEffect(() => {
    if (!selectedCemetery) {
      setMartyrs([]);
      return;
    }

    setDataLoading(true);
    const supabase = createClient();
    supabase
      .from("martyrs")
      .select("*")
      .eq("cemetery", selectedCemetery)
      .then(({ data, error }) => {
        if (error || !data) {
          setMartyrs([]);
        } else {
          setMartyrs(data.map(m => ({ ...m, cemetery: m.cemetery.normalize("NFC") })));
        }
        setDataLoading(false);
      });
  }, [selectedCemetery]);

  // Sync state changes back to URL pathname
  useEffect(() => {
    const slug = CEMETERY_TO_SLUG[selectedCemetery] ?? "";
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const segments = pathname.split("/").filter(Boolean);
      const currentSlug = segments[segments.length - 1] || "";
      if (currentSlug !== slug) {
        const nextPath = slug ? `/${slug}` : "/";
        window.history.pushState(null, "", nextPath);
      }
    }
  }, [selectedCemetery]);

  // Reset zone & page when cemetery changes
  useEffect(() => { setSelectedZone(""); }, [selectedCemetery]);


  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearchName(""); setSearchHometown(""); setSearchBirthYear("");
    setSelectedCemetery(""); setSelectedZone("");
  };

  /** Click liệt sĩ từ danh sách hoặc bản đồ → mở Bottom Card trước */
  const handleOpenDetails = (martyr: Martyr) => {
    setSelectedMartyr(martyr);
    setIsBottomCardOpen(true);
    setIsModalOpen(false); // đảm bảo modal đầy đủ không mở cùng lúc
  };

  /** Từ Bottom Card → mở modal tiểu sử đầy đủ */
  const handleOpenFullModalFromCard = () => {
    setIsModalOpen(true);
  };

  /** Đóng Bottom Card và bỏ chọn liệt sĩ */
  const handleCloseBottomCard = () => {
    setIsBottomCardOpen(false);
    setSelectedMartyr(null);
  };

  if (!selectedCemetery) {
    return (
      <>
        {renderLoader()}
        <ProjectIntro onEnterSearch={() => setIsCemeteryModalOpen(true)} />
        {isCemeteryModalOpen && (
          <CemeterySelectionModal
            onClose={() => setIsCemeteryModalOpen(false)}
            onSelect={(cem) => {
              setSelectedCemetery(cem);
              setIsCemeteryModalOpen(false);
            }}
          />
        )}
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {renderLoader()}
      <BackgroundMusic />
      <div className="app-layout-root">
      <header className="app-header">
        {/* Left: Logos + Title */}
        <div className="header-left">
          {/* Logos */}
          <div className="header-logos">
            <a 
              href="https://www.facebook.com/svtnhaiduong.vnu" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="logo-link"
            >
              <img src="/logo_svtn.webp" alt="Logo Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội" className="logo-img" />
            </a>
            <img src="/logo_doan_xa.webp" alt="Logo Đoàn xã Tứ Kỳ" className="logo-img" />
          </div>

          {/* Vertical line separator */}
          <div className="header-separator" />

          {/* Titles */}
          <div className="header-title-container">
            <h1 className="header-title-text">
              Nghĩa trang xã Tứ Kỳ
            </h1>
          </div>
        </div>

        {/* Right: Selected Cemetery & Search Button */}
        <div className="header-right">
          {selectedCemetery && (
            <CemeteryDropdown
              value={selectedCemetery}
              onOpenModal={() => setIsCemeteryModalOpen(true)}
            />
          )}
          {/* Quick Search Autocomplete */}
          <div className="quick-search-wrapper" ref={quickSearchRef}>
            <div className="quick-search-input-container">
              <Search size={14} className="quick-search-icon" />
              <input
                type="text"
                className="quick-search-input"
                placeholder="Tìm nhanh tên liệt sĩ..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                onFocus={() => setIsQuickSearchFocused(true)}
              />
              {quickSearch && (
                <button
                  className="quick-search-clear"
                  onClick={() => { setQuickSearch(""); setIsQuickSearchFocused(false); }}
                >
                  <X size={12} />
                </button>
              )}
              <button
                className="quick-search-filter-btn"
                onClick={() => setIsFilterModalOpen(true)}
                title="Tìm kiếm nâng cao"
              >
                Tìm nâng cao
              </button>
            </div>
            {isQuickSearchFocused && quickSearch.length >= 2 && (
              <div className="quick-search-dropdown">
                {quickSearchSuggestions.length > 0 ? (
                  quickSearchSuggestions.map((m) => (
                    <div
                      key={m.id}
                      className="quick-search-item"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      onClick={() => { handleOpenDetails(m); setIsQuickSearchFocused(false); }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="quick-search-item-name">{m.name}</div>
                        <div className="quick-search-item-meta">
                          {m.cemetery} · Mộ {m.grave_no || "—"}, H{m.row_no || "—"}, Khu {getPhysicalZone(m)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickSelect(m);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: "6px",
                          color: "var(--gold)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                        title="Xem vị trí trên sơ đồ"
                      >
                        <Crosshair size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="quick-search-empty">Không tìm thấy kết quả</div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN VIEW CONTAINER ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>

        {/* ── MAIN DISPLAY: Map & grave-grid panel ─────────────────────────────────────── */}
        <main className="main-display-panel" style={{ backgroundColor: "#FDFCF7", flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
        {/* Background watermark */}
        <LotusMotif size={240} style={{ position: "absolute", bottom: "10px", right: "10px", opacity: 0.04, zIndex: 0 }} />

        <div className="tab-content-container" style={{ zIndex: 1, marginTop: "0" }}>
          <div className="map-tab-view">

            {/* Cemetery map */}
            <section ref={graveGridRef} className="map-card-wrapper" style={{ position: "relative" }}>
              <LotusMotif size={100} style={{ position: "absolute", top: "10px", right: "20px", opacity: 0.05 }} />

              <CemeteryMap
                selectedCemetery={selectedCemetery}
                selectedZone={selectedZone}
                allMartyrs={martyrs}
                selectedMartyrId={selectedMartyr?.id}
                onSelectMartyr={handleOpenDetails}
                onSelectZone={setSelectedZone}
              />
            </section>

          </div>
        </div>
      </main>

      {/* ── Bottom Preview Card ────────────────────────────────────────────────── */}
      {isBottomCardOpen && selectedMartyr && !isModalOpen && (
        <MartyrBottomCard
          martyr={selectedMartyr}
          onClose={handleCloseBottomCard}
          onOpenFullModal={handleOpenFullModalFromCard}
          onLocate={handleLocateMartyrGrave}
        />
      )}

      {/* ── Detail modal (đầy đủ) ──────────────────────────────────────────────── */}
      {isModalOpen && selectedMartyr && (
        <MartyrModal
          martyr={selectedMartyr}
          onClose={() => {
            setIsModalOpen(false);
            // Khi đóng modal đầy đủ, giữ Bottom Card để người dùng không mất context
            setIsBottomCardOpen(true);
          }}
          onLocate={handleLocateMartyrGrave}
        />
      )}

      {/* ── Filter modal ───────────────────────────────────────────────────────── */}
      {isFilterModalOpen && (
        <div 
          className="modal-overlay filter-modal-overlay" 
          onClick={() => setIsFilterModalOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
            boxSizing: "border-box"
          }}
        >
          <div 
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FAF6EE",
              border: "2px solid #E4D8C3",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #EADFCE", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Filter size={18} style={{ color: "var(--gold)" }} />
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontFamily: "var(--font-serif)", color: "var(--text-bright)" }}>Tìm kiếm & Lọc liệt sĩ</h3>
              </div>

            </div>

            {/* Content (Body - Scrollable) */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflowY: "auto" }}>
              {/* Grid search inputs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="filter-grid-2col">
                {/* Cemetery select */}
                <div className="sidebar-search-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="sidebar-search-label" style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.85rem", color: "var(--text-bright)" }}>Nghĩa trang</label>
                  <button
                    type="button"
                    onClick={() => setIsCemeteryModalOpen(true)}
                    style={{
                      width: "100%",
                      borderColor: "#DDD4C0",
                      padding: "0.6rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid #DDD4C0",
                      fontSize: "0.9rem",
                      textAlign: "left",
                      backgroundColor: "#FFFFFF",
                      color: selectedCemetery ? "var(--text-bright)" : "var(--text-muted)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                  >
                    <span>{selectedCemetery || "Chọn nghĩa trang..."}</span>
                    <Map size={14} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>

                {/* Name search */}
                <div className="sidebar-search-group">
                  <label className="sidebar-search-label" htmlFor="modal-filter-name" style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.85rem", color: "var(--text-bright)" }}>Họ và tên</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      id="modal-filter-name" 
                      type="text" 
                      className="sidebar-search-input"
                      style={{ paddingLeft: "2.2rem", borderColor: "#DDD4C0", width: "100%", padding: "0.6rem 0.6rem 0.6rem 2.2rem", borderRadius: "8px", border: "1px solid #DDD4C0", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }}
                      placeholder="Tìm tên..."
                      value={searchName} 
                      onChange={(e) => setSearchName(e.target.value)} 
                    />
                    <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  </div>
                </div>

                {/* Hometown search */}
                <div className="sidebar-search-group">
                  <label className="sidebar-search-label" htmlFor="modal-filter-hometown" style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.85rem", color: "var(--text-bright)" }}>Quê quán</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      id="modal-filter-hometown" 
                      type="text" 
                      className="sidebar-search-input"
                      style={{ paddingLeft: "2.2rem", borderColor: "#DDD4C0", width: "100%", padding: "0.6rem 0.6rem 0.6rem 2.2rem", borderRadius: "8px", border: "1px solid #DDD4C0", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }}
                      placeholder="Quê quán..."
                      value={searchHometown} 
                      onChange={(e) => setSearchHometown(e.target.value)} 
                    />
                    <MapPin size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  </div>
                </div>

                {/* Birth year search */}
                <div className="sidebar-search-group">
                  <label className="sidebar-search-label" htmlFor="modal-filter-birth" style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.85rem", color: "var(--text-bright)" }}>Năm sinh</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      id="modal-filter-birth" 
                      type="text" 
                      className="sidebar-search-input"
                      style={{ paddingLeft: "2.2rem", borderColor: "#DDD4C0", width: "100%", padding: "0.6rem 0.6rem 0.6rem 2.2rem", borderRadius: "8px", border: "1px solid #DDD4C0", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }}
                      placeholder="Ví dụ: 1930"
                      value={searchBirthYear} 
                      onChange={(e) => setSearchBirthYear(e.target.value)} 
                    />
                    <Calendar size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  </div>
                </div>

                {/* Zone select (only when a cemetery is selected) */}
                {selectedCemetery && (
                  <div className="sidebar-search-group">
                    <label className="sidebar-search-label" htmlFor="modal-filter-zone" style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.85rem", color: "var(--text-bright)" }}>Khu vực</label>
                    <div className="select-wrapper" style={{ position: "relative" }}>
                      <select
                        id="modal-filter-zone"
                        className="sidebar-search-input"
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        style={{ appearance: "none", width: "100%", borderColor: "#DDD4C0", padding: "0.6rem 2.2rem 0.6rem 1rem", borderRadius: "8px", border: "1px solid #DDD4C0", fontSize: "0.9rem", outline: "none", backgroundColor: "#FFFFFF" }}
                      >
                        <option value="">Tất cả các khu</option>
                        {availableZones.map((z) => (
                          <option key={z} value={z}>Khu {z}</option>
                        ))}
                      </select>
                      <Map size={14} className="select-arrow" style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#EADFCE", margin: "0.5rem 0" }} />

              {/* Results List inside Modal */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #EADFCE", paddingBottom: "0.4rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-bright)", letterSpacing: "0.05em" }}>DANH SÁCH ANH HÙNG LIỆT SĨ</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--gold-dark)", fontWeight: "600" }}>{filteredMartyrs.length} phần mộ</span>
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {filteredMartyrs.length > 0 ? (
                    filteredMartyrs.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleOpenDetails(m)}
                        className="martyr-list-card"
                      >
                        <div style={{ color: "var(--primary-red)", fontWeight: 700, fontSize: "0.95rem" }}>{m.name}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                          <span><strong>Năm sinh:</strong> {m.birth_year || "Chưa rõ"}</span>
                          <span className="truncate"><strong>Quê quán:</strong> {m.hometown || "Chưa rõ"}</span>
                          <span><strong>Vị trí:</strong> Mộ {m.grave_no || "—"}, Hàng {m.row_no || "—"}, Khu {getPhysicalZone(m)}</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                          <button
                            className="btn btn-gold btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleLocateMartyrGrave(m); setIsFilterModalOpen(false); }}
                            style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem", backgroundColor: "var(--gold)", color: "#FFFFFF", border: "none", borderRadius: "4px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem", transition: "background-color 0.2s" }}
                          >
                            <Crosshair size={12} /> Xem vị trí trên sơ đồ
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)" }}>
                      <Info size={32} style={{ color: "var(--gold)", marginBottom: "0.5rem", opacity: 0.6 }} />
                      <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>Không tìm thấy liệt sĩ</p>
                      <p style={{ fontSize: "0.75rem" }}>Vui lòng thay đổi thông tin lọc.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderTop: "1px solid #EADFCE", backgroundColor: "#FAF6EE", flexShrink: 0 }} className="modal-footer-actions">
              <button
                className="btn btn-secondary"
                onClick={handleResetFilters}
                style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary-red)", borderColor: "#E4D8C3", borderRadius: "6px" }}
              >
                <RotateCcw size={14} /> Xóa bộ lọc
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setIsFilterModalOpen(false)}
                style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: "600", color: "#FFFFFF", borderRadius: "6px" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isCemeteryModalOpen && (
        <CemeterySelectionModal
          onClose={() => setIsCemeteryModalOpen(false)}
          onSelect={(cem) => {
            setSelectedCemetery(cem);
            setIsCemeteryModalOpen(false);
          }}
          selectedValue={selectedCemetery}
        />
      )}

    </div>
    </div>
    </>
  );
}
