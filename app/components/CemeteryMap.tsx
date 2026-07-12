"use client";
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */

import { useMemo, useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
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

  // --- Zoom & Pan State ---
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const hasCaptured = useRef(false);
  const pointerDownCoords = useRef({ x: 0, y: 0 });

  // Refs for tracking multi-touch pointers & pinch-zoom params
  const activePointers = useRef<{ pointerId: number; clientX: number; clientY: number }[]>([]);
  const pinchStartDist = useRef<number>(0);
  const pinchStartScale = useRef<number>(1);
  const pinchStartCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartTranslate = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // --- Tooltip & Interaction State ---
  const [hoveredMartyr, setHoveredMartyr] = useState<Martyr | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

  // Auto-zoom/focus disabled by user request

  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const zoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setTranslateX(0);
        setTranslateY(0);
      }
      return next;
    });
  };
  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    activePointers.current = [];
    pinchStartDist.current = 0;
  };

  // Reset zoom on cemetery change
  useEffect(() => {
    resetZoom();
  }, [selectedCemetery]);

  const handlePointerOverGrave = (e: React.PointerEvent, martyr: Martyr) => {
    setHoveredMartyr(martyr);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMoveGrave = (e: React.PointerEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerOutGrave = () => {
    setHoveredMartyr(null);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    const zoomIntensity = 0.05;
    const delta = -e.deltaY;
    setScale((prevScale) => {
      const nextScale = Math.max(1, Math.min(prevScale + (delta > 0 ? 1 : -1) * zoomIntensity, 4));
      if (nextScale === 1) {
        setTranslateX(0);
        setTranslateY(0);
      }
      return nextScale;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // Track active pointer info
    const pointerList = activePointers.current;
    const existingIdx = pointerList.findIndex(p => p.pointerId === e.pointerId);
    const pointerData = { pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY };
    if (existingIdx !== -1) {
      pointerList[existingIdx] = pointerData;
    } else {
      pointerList.push(pointerData);
    }

    hasCaptured.current = false;

    if (pointerList.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - translateX, y: e.clientY - translateY };
      pointerDownCoords.current = { x: e.clientX, y: e.clientY };
    } else if (pointerList.length === 2) {
      setIsDragging(false);
      try {
        e.currentTarget.setPointerCapture(pointerList[0].pointerId);
        e.currentTarget.setPointerCapture(pointerList[1].pointerId);
      } catch {
        // Ignore if setPointerCapture fails
      }
      const p1 = pointerList[0];
      const p2 = pointerList[1];
      const dx = p1.clientX - p2.clientX;
      const dy = p1.clientY - p2.clientY;
      pinchStartDist.current = Math.sqrt(dx * dx + dy * dy);
      pinchStartScale.current = scale;
      pinchStartCenter.current = {
        x: (p1.clientX + p2.clientX) / 2,
        y: (p1.clientY + p2.clientY) / 2
      };
      pinchStartTranslate.current = { x: translateX, y: translateY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pointerList = activePointers.current;
    const idx = pointerList.findIndex(p => p.pointerId === e.pointerId);
    if (idx !== -1) {
      pointerList[idx] = { pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY };
    } else {
      pointerList.push({ pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY });
    }

    if (pointerList.length === 1 && isDragging) {
      if (!hasCaptured.current) {
        const dx = e.clientX - pointerDownCoords.current.x;
        const dy = e.clientY - pointerDownCoords.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 3) {
          hasCaptured.current = true;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Ignore
          }
        }
      }

      if (hasCaptured.current) {
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;

        // Bound movement based on scale
        const limitX = 400 * scale;
        const limitY = 250 * scale;
        setTranslateX(Math.max(-limitX, Math.min(limitX, newX)));
        setTranslateY(Math.max(-limitY, Math.min(limitY, newY)));
      }

    } else if (pointerList.length === 2) {
      const p1 = pointerList[0];
      const p2 = pointerList[1];
      const dx = p1.clientX - p2.clientX;
      const dy = p1.clientY - p2.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (pinchStartDist.current > 0) {
        const factor = dist / pinchStartDist.current;
        const nextScale = Math.max(1, Math.min(pinchStartScale.current * factor, 4));
        setScale(nextScale);

        // Compute current pinch midpoint
        const currentCenterX = (p1.clientX + p2.clientX) / 2;
        const currentCenterY = (p1.clientY + p2.clientY) / 2;

        // Formula: translation = current midpoint - (scale_ratio * offset_from_midpoint_to_previous_origin)
        const nextTranslateX = currentCenterX - (nextScale / pinchStartScale.current) * (pinchStartCenter.current.x - pinchStartTranslate.current.x);
        const nextTranslateY = currentCenterY - (nextScale / pinchStartScale.current) * (pinchStartCenter.current.y - pinchStartTranslate.current.y);

        const limitX = 400 * nextScale;
        const limitY = 250 * nextScale;
        setTranslateX(Math.max(-limitX, Math.min(limitX, nextTranslateX)));
        setTranslateY(Math.max(-limitY, Math.min(limitY, nextTranslateY)));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore errors
    }

    activePointers.current = activePointers.current.filter(p => p.pointerId !== e.pointerId);
    const pointerList = activePointers.current;

    if (pointerList.length === 1) {
      // Seamless fallback to single-finger dragging
      const remainingPointer = pointerList[0];
      setIsDragging(true);
      dragStart.current = {
        x: remainingPointer.clientX - translateX,
        y: remainingPointer.clientY - translateY
      };
      pointerDownCoords.current = {
        x: remainingPointer.clientX,
        y: remainingPointer.clientY
      };
      hasCaptured.current = false;
    } else if (pointerList.length === 0) {
      setIsDragging(false);
      hasCaptured.current = false;
    }
  };

  // Is the selected cemetery Minh Đức? (We draw local landscape details like ponds)
  const isMinhDuc = selectedCemetery === "Nghĩa trang liệt sĩ Minh Đức";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", height: "100%" }}>
      {/* Programmatic Vector Map Canvas */}
      <div 
        ref={mapContainerRef}
        className="cemetery-map-container"
      >
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
            onClick={zoomIn} 
            title="Phóng to bản đồ"
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "8px", 
              backgroundColor: "#FFFFFF", 
              border: "1px solid var(--card-border)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-bright)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F5EFE2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
          >
            <ZoomIn size={20} />
          </button>
          <button 
            onClick={zoomOut} 
            title="Thu nhỏ bản đồ"
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "8px", 
              backgroundColor: "#FFFFFF", 
              border: "1px solid var(--card-border)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-bright)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F5EFE2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
          >
            <ZoomOut size={20} />
          </button>
          <button 
            onClick={resetZoom} 
            title="Đặt lại bản đồ về mặc định"
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "8px", 
              backgroundColor: "#FFFFFF", 
              border: "1px solid var(--card-border)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-bright)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F5EFE2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* SVG Programmatic Overlay */}
        <svg 
          viewBox="0 0 1000 562" 
          style={{ 
            width: "100%", 
            height: "100%", 
            display: "block",
            touchAction: "none"
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* Dot Grid Pattern */}
          <defs>
            <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.75" fill="rgba(164,123,46,0.15)" />
            </pattern>
          </defs>
          <rect width="1000" height="562" fill="url(#dotGrid)" />

          {/* Group wrapper with zoom/pan applied */}
          <g
            style={{
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transformOrigin: "500px 281px",
              transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              cursor: isDragging ? "grabbing" : "grab"
            }}
          >
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
      </div>

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
