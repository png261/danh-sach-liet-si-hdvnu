"use client";
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */

import { useMemo, useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone, groupMartyrsByRow } from "@/app/lib/martyrUtils";

interface CemeteryMapProps {
  selectedCemetery: string;
  selectedZone: string;
  allMartyrs: Martyr[];
  selectedMartyrId?: string;
  onSelectMartyr: (martyr: Martyr) => void;
  onSelectZone: (zone: string) => void;
}

interface ZoneBoundary {
  xStart: number;
  yStart: number;
  width: number;
  height: number;
}

const ZONE_BOUNDARIES: Record<string, ZoneBoundary> = {
  A: { xStart: 15, yStart: 95, width: 435, height: 420 },
  B: { xStart: 550, yStart: 95, width: 435, height: 420 }
};

export default function CemeteryMap({
  selectedCemetery,
  selectedZone,
  allMartyrs,
  selectedMartyrId,
  onSelectMartyr,
  onSelectZone
}: CemeteryMapProps) {

  // --- Tooltip & Interaction State ---
  const [hoveredMartyr, setHoveredMartyr] = useState<Martyr | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // --- Responsive / Mobile detection & Auto-Centering ---
  const [isMobile, setIsMobile] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Programmatically trigger centering after layout shifts have settled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (transformRef.current) {
        transformRef.current.centerView(isMobile ? 2.5 : 1, 0);
      }
    }, 150); // Small delay to let browser lay out the flexbox dimensions
    return () => clearTimeout(timer);
  }, [selectedCemetery, isMobile]);

  const isTuKy = selectedCemetery === "Nghĩa trang liệt sĩ Tứ Kỳ";
  const isQuangKhai = selectedCemetery === "Nghĩa trang liệt sĩ Quang Khải";
  const isQuangPhuc = selectedCemetery === "Nghĩa trang liệt sĩ Quang Phục";

  // Compute grave layout details dynamically for Khu A and Khu B
  const graveLayoutData = useMemo(() => {
    const result: Record<string, {
      rows: ReturnType<typeof groupMartyrsByRow>;
      maxCols: number;
      boundary: ZoneBoundary;
    }> = {};

    const isQuangKhai = selectedCemetery === "Nghĩa trang liệt sĩ Quang Khải";

    ["A", "B"].forEach((zoneName) => {
      const rows = groupMartyrsByRow(allMartyrs, selectedCemetery, zoneName);
      const maxCols = rows.length > 0 ? Math.max(...rows.map(r => r.martyrs.length)) : 10;
      const boundary = {
        xStart: ZONE_BOUNDARIES[zoneName].xStart,
        // For Quang Khải, graves sit in the upper portion (behind the central lầu)
        yStart: isQuangKhai ? 95 : ZONE_BOUNDARIES[zoneName].yStart,
        width: ZONE_BOUNDARIES[zoneName].width,
        height: isQuangKhai ? 180 : ZONE_BOUNDARIES[zoneName].height
      };
      result[zoneName] = { rows, maxCols, boundary };
    });

    return result;
  }, [selectedCemetery, allMartyrs]);

  const handlePointerOverGrave = (e: React.PointerEvent, martyr: Martyr) => {
    if (isMobile) return;
    setHoveredMartyr(martyr);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMoveGrave = (e: React.PointerEvent) => {
    if (isMobile) return;
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerOutGrave = () => {
    if (isMobile) return;
    setHoveredMartyr(null);
  };

  // Is the selected cemetery Minh Đức? (We draw local landscape details like ponds)
  const isMinhDuc = selectedCemetery === "Nghĩa trang liệt sĩ Minh Đức";

  // Find the exact X and Y coordinates of a martyr in the SVG coordinate space (0-1000, 0-562)
  const getMartyrCoordinates = (martyrId: string) => {
    const martyr = allMartyrs.find(m => m.id === martyrId);
    if (!martyr) return null;

    const zoneName = getPhysicalZone(martyr);
    if (zoneName !== "A" && zoneName !== "B") return null;

    const { rows, maxCols, boundary } = graveLayoutData[zoneName];
    const { xStart, yStart, width, height } = boundary;

    // Find the row index and column index of the martyr in this zone
    let rowIndex = -1;
    let colIndex = -1;
    
    for (let r = 0; r < rows.length; r++) {
      const c = rows[r].martyrs.findIndex(m => m.id === martyrId);
      if (c !== -1) {
        rowIndex = r;
        colIndex = c;
        break;
      }
    }

    if (rowIndex === -1 || colIndex === -1) return null;

    const R = rows.length;
    const cellGap = 3;
    const cellW = (width / maxCols) - cellGap;
    const cellH = (height / R) - cellGap;

    const isExtraGrave = isMinhDuc && zoneName === "B" && rowIndex < 3 && colIndex >= 6;
    const xOffset = isExtraGrave ? 35 : 0;

    const cellX = xStart + colIndex * (width / maxCols) + cellGap / 2 + xOffset;
    const cellY = yStart + rowIndex * (height / R) + cellGap / 2;

    return {
      x: cellX + cellW / 2,
      y: cellY + cellH / 2
    };
  };

  // Programmatically zoom and center on a selected martyr's grave on mobile
  useEffect(() => {
    if (!selectedMartyrId || !isMobile) return;

    const timer = setTimeout(() => {
      const wrapper = mapContainerRef.current;
      if (!wrapper || !transformRef.current) return;

      const W = wrapper.clientWidth;
      const H = wrapper.clientHeight;

      const coords = getMartyrCoordinates(selectedMartyrId);
      if (coords) {
        const s = 3.5; // Zoom scale for grave focus
        const lx = coords.x * (W / 1000);
        const ly = coords.y * (W / 1000);
        const tx = (W / 2) - (lx * s);
        // Đưa ngôi mộ lên góc trên màn hình (25% chiều cao) để tránh bị Bottom Card che mất
        const ty = (H / 4) - (ly * s);
        
        transformRef.current.setTransform(tx, ty, s, 600); // 600ms smooth transition
      }
    }, 250); // Delay to let search panels/modals close and layout settle

    return () => clearTimeout(timer);
  }, [selectedMartyrId, isMobile]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", height: "100%" }}>
      {/* Programmatic Vector Map Canvas */}
      <TransformWrapper
        ref={transformRef}
        key={`${selectedCemetery}-${isMobile}`}
        initialScale={isMobile ? 2.5 : 1}
        minScale={isMobile ? 1.2 : 0.8}
        maxScale={isMobile ? 5 : 4}
        limitToBounds={true}
        centerOnInit={true}
        centerZoomedOut={true}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <div ref={mapContainerRef} className="cemetery-map-container" style={{ position: "relative" }}>
            {/* Floating map controls */}
            <div 
              style={{ 
                position: "absolute", 
                bottom: "12px", 
                left: "12px", 
                display: "flex", 
                flexDirection: "row", 
                gap: "8px",
                zIndex: 10
              }}
            >
              <button 
                onClick={() => zoomIn()} 
                title="Phóng to bản đồ"
                style={{ 
                  height: "36px", 
                  padding: "0 12px",
                  borderRadius: "8px", 
                  backgroundColor: "#FFFFFF", 
                  border: "1px solid var(--card-border)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-bright)",
                  fontWeight: "500",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F5EFE2"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
              >
                Phóng to
              </button>
              <button 
                onClick={() => zoomOut()} 
                title="Thu nhỏ bản đồ"
                style={{ 
                  height: "36px", 
                  padding: "0 12px",
                  borderRadius: "8px", 
                  backgroundColor: "#FFFFFF", 
                  border: "1px solid var(--card-border)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-bright)",
                  fontWeight: "500",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F5EFE2"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
              >
                Thu nhỏ
              </button>
              <button 
                onClick={() => resetTransform()} 
                title="Đặt lại bản đồ về mặc định"
                style={{ 
                  height: "36px", 
                  padding: "0 12px",
                  borderRadius: "8px", 
                  backgroundColor: "#FFFFFF", 
                  border: "1px solid var(--card-border)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-bright)",
                  fontWeight: "500",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F5EFE2"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
              >
                Đặt lại
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                overflow: "hidden"
              }}
              contentStyle={{
                width: "100%"
              }}
            >
              {/* SVG Programmatic Overlay */}
              <svg 
                viewBox="0 0 1000 562" 
                preserveAspectRatio="xMidYMid meet"
                style={{ 
                  width: "100%", 
                  aspectRatio: "1000 / 562",
                  display: "block"
                }}
              >
                {/* Dot Grid Pattern */}
                <defs>
                  <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="0.75" fill="rgba(164,123,46,0.15)" />
                  </pattern>
                </defs>
                <rect width="1000" height="562" fill="url(#dotGrid)" />

                {/* Group wrapper containing all map elements */}
                <g>
                  {/* Dong Son Drum Watermark Background */}
                  <image 
                    href="/trong_dong.svg"
                    x="200" 
                    y="-19" 
                    width="600" 
                    height="600" 
                    opacity="0.035"
                    style={{
                      pointerEvents: "none",
                      filter: "invert(53%) sepia(35%) saturate(1067%) hue-rotate(354deg) brightness(94%) contrast(92%)"
                    }}
                  />

            {/* 2. Central concrete pathway */}
            <rect x="465" y="60" width="70" height="502" fill="#EADFCE" opacity="0.45" rx="4" />
            <line x1="465" y1="60" x2="465" y2="562" stroke="rgba(164,123,46,0.25)" strokeWidth="1.5" />
            <line x1="535" y1="60" x2="535" y2="562" stroke="rgba(164,123,46,0.25)" strokeWidth="1.5" />

            {/* 3. Monument (Đài Tưởng Niệm) custom graphic image based on cemetery */}
            <g>
              <image 
                href={
                  selectedCemetery === "Nghĩa trang liệt sĩ Tứ Kỳ" ? "/monument_tu_ky.png" :
                  selectedCemetery === "Nghĩa trang liệt sĩ Minh Đức" ? "/monument_minh_duc.png" :
                  selectedCemetery === "Nghĩa trang liệt sĩ Quang Khải" ? "/monument_quang_khai.png" :
                  selectedCemetery === "Nghĩa trang liệt sĩ Quang Phục" ? "/monument_quang_phuc.png" :
                  "/monument_tu_ky.png"
                }
                x={isQuangKhai ? "435" : isQuangPhuc ? "460" : "455"} 
                y={isQuangKhai ? "225" : isQuangPhuc ? "5" : "5"} 
                width={isQuangKhai ? "130" : isQuangPhuc ? "80" : "90"} 
                height={isQuangKhai ? "120" : isQuangPhuc ? "120" : "80"} 
              />
            </g>

            {/* 4. Entrance Gate (Cổng Chính) traditional gate graphic image */}
            <g>
              <image 
                href={
                  isQuangKhai ? "/gate_quang_khai.png" :
                  isQuangPhuc ? "/gate_quang_phuc.png" :
                  "/gate_cemetery.png"
                }
                x={isQuangKhai ? "435" : isQuangPhuc ? "415" : "445"} 
                y={isQuangPhuc ? "440" : "450"} 
                width={isQuangKhai ? "130" : isQuangPhuc ? "170" : "110"} 
                height={isQuangPhuc ? "120" : "110"} 
              />
            </g>

            {/* 5. Tứ Kỳ & Minh Đức Shrines (2 ngôi đền ở cuối nghĩa trang) */}
            {(isTuKy || isMinhDuc) && (
              <g>
                {/* 5.1. Left Pavilion (Nhà che bia mộ trái) */}
                <image
                  href="/pavilion_tu_ky.png"
                  x="330"
                  y="10"
                  width="65"
                  height="65"
                />

                {/* 5.2. Right Pavilion (Nhà che bia mộ phải) */}
                <image
                  href="/pavilion_tu_ky.png"
                  x="605"
                  y="10"
                  width="65"
                  height="65"
                />
              </g>
            )}

            {/* 6. Tứ Kỳ specific fence */}
            {isTuKy && (
              <g>
                {/* Picket fence at the bottom (removed visual white lines) */}
              </g>
            )}

{/* 6.5. Quang Khải: no extra landscape elements */}

            {/* 6.6. Quang Phục: perimeter fence (removed visual white lines) */}
            {isQuangPhuc && (
              <g>
                {/* Perimeter fence lines removed */}
              </g>
            )}

            {/* 7. Draw Graves for both Khu A and Khu B */}
            {["A", "B"].map((zoneName) => {
              const { rows, maxCols, boundary } = graveLayoutData[zoneName];
              if (rows.length === 0) return null;

              const { xStart, yStart, width, height } = boundary;
              const R = rows.length;
              const cellGap = 3;

              return (
                <g key={zoneName}>


                  {/* Zone title label */}
                  <text 
                    x={xStart + width / 2} 
                    y={yStart - 7} 
                    style={{ 
                      fontSize: "10px", 
                      fontWeight: "800", 
                      fill: "var(--gold)",
                      textAnchor: "middle",
                      letterSpacing: "0.03em"
                    }}
                  >
                    KHU {zoneName} ({allMartyrs.filter(m => m.cemetery === selectedCemetery && getPhysicalZone(m) === zoneName).length} mộ)
                  </text>

                  {/* Row coordinates labels (H1, H2...) */}
                  {rows.map((row, rIdx) => {
                    const cellH = (height / R) - cellGap;
                    const cellY = yStart + rIdx * (height / R) + cellGap / 2;
                    const labelY = cellY + cellH / 2 + 3; // Baseline shift
                    const labelX = zoneName === "A" ? xStart - 8 : xStart + width + 8;
                    const rowLabel = row.rowName.replace("Hàng ", "H");
                    return (
                      <text
                        key={`row-label-${rIdx}`}
                        x={labelX}
                        y={labelY}
                        style={{
                          fontSize: "8px",
                          fontWeight: "700",
                          fill: "var(--text-muted)",
                          opacity: 0.65,
                          textAnchor: zoneName === "A" ? "end" : "start",
                          userSelect: "none"
                        }}
                      >
                        {rowLabel}
                      </text>
                    );
                  })}

                  {/* Column coordinates labels (1, 2...) */}
                  {Array.from({ length: maxCols }).map((_, cIdx) => {
                    const cellW = (width / maxCols) - cellGap;
                    const cellX = xStart + cIdx * (width / maxCols) + cellGap / 2;
                    const labelX = cellX + cellW / 2;
                    return (
                      <text
                        key={`col-label-${cIdx}`}
                        x={labelX}
                        y={yStart + height + 12}
                        style={{
                          fontSize: "8px",
                          fontWeight: "600",
                          fill: "var(--text-muted)",
                          opacity: 0.65,
                          textAnchor: "middle",
                          userSelect: "none"
                        }}
                      >
                        {cIdx + 1}
                      </text>
                    );
                  })}

                  {/* Draw each grave cell */}
                  {rows.map((row, rIdx) => {
                    return row.martyrs.map((martyr, cIdx) => {
                      const isSelected = martyr.id === selectedMartyrId;
                      
                      // Coordinates math
                      const cellW = (width / maxCols) - cellGap;
                      const cellH = (height / R) - cellGap;
                      
                      // For Minh Đức, shift the extra graves at the top-right of Zone B to the right
                      const isExtraGrave = isMinhDuc && zoneName === "B" && rIdx < 3 && cIdx >= 6;
                      const xOffset = isExtraGrave ? 35 : 0;

                      const cellX = xStart + cIdx * (width / maxCols) + cellGap / 2 + xOffset;
                      const cellY = yStart + rIdx * (height / R) + cellGap / 2;

                      return (
                        <g
                          key={martyr.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectZone(zoneName);
                            onSelectMartyr(martyr);
                          }}
                          onPointerOver={(e) => handlePointerOverGrave(e, martyr)}
                          onPointerMove={handlePointerMoveGrave}
                          onPointerOut={handlePointerOutGrave}
                          style={{ cursor: "pointer" }}
                          className={`grave-cell-map${isSelected ? " selected" : ""}`}
                        >
                          {/* 1. Grave transparent PNG illustration */}
                          <image
                            href="/grave_illustration.png"
                            x={cellX}
                            y={cellY}
                            width={cellW}
                            height={cellH}
                            style={{
                              opacity: martyr.is_unknown ? 0.6 : 1,
                              transition: "all 0.15s ease",
                              filter: isSelected ? "drop-shadow(0px 0px 4px rgba(255, 248, 6, 0.95))" : "none"
                            }}
                          />
                        </g>
                      );
                    });
                  })}
                </g>
              );
            })}
                </g>
              </svg>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>

      {/* Floating Tooltip */}
      {hoveredMartyr && (
        <div 
          className="map-hover-tooltip"
          style={{
            position: "fixed",
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y + 15}px`,
            pointerEvents: "none",
            zIndex: 10000,
          }}
        >
          <div className="tooltip-title">{hoveredMartyr.name}</div>
          <div className="tooltip-row"><strong>Năm sinh:</strong> {hoveredMartyr.birth_year || "Chưa rõ"}</div>
          <div className="tooltip-row"><strong>Quê quán:</strong> {hoveredMartyr.hometown || "Chưa rõ"}</div>
          <div className="tooltip-row"><strong>Vị trí:</strong> Mộ {hoveredMartyr.grave_no || "—"}, Hàng {hoveredMartyr.row_no || "—"}, Khu {getPhysicalZone(hoveredMartyr)}</div>
        </div>
      )}
    </div>
  );
}
