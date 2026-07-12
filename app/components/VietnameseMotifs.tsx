// Vietnamese cultural SVG motif components

/** Dong Son Bronze Drum Sun-Star (Mặt Trống Đồng) */
export function DongSonStar({
  size = 36,
  className = "",
  style = {},
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ color: "var(--gold)", flexShrink: 0, ...style }}
    >
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,2" />
      <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
      <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="1" />
      {/* 12-point sun star */}
      <path
        d="M 50 16 L 53 34 L 70 24 L 59 39 L 80 43 L 62 48 L 74 66 L 56 53 L 59 74 L 48 57 L 38 74 L 42 53 L 24 66 L 36 48 L 18 43 L 39 39 L 28 24 L 45 34 Z"
        fill="currentColor"
      />
      {/* Lạc Bird arcs */}
      <path d="M 50 6 A 44 44 0 0 1 94 50" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6,8" strokeLinecap="round" />
      <path d="M 50 94 A 44 44 0 0 1 6 50"  fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6,8" strokeLinecap="round" />
    </svg>
  );
}

/** Lotus flower watermark (Hoa Sen) */
export function LotusMotif({
  size = 64,
  className = "",
  style = {},
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={size}
      className={className}
      style={{ color: "var(--gold)", opacity: 0.12, pointerEvents: "none", ...style }}
    >
      <path d="M 60 85 C 45 75, 22 55, 22 40 C 22 20, 45 8, 60 3 C 75 8, 98 20, 98 40 C 98 55, 75 75, 60 85 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M 60 85 C 51 70, 36 50, 36 40 C 36 26, 51 15, 60 12 C 69 15, 84 26, 84 40 C 84 50, 69 70, 60 85 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M 60 85 C 55 65, 49 45, 49 40 C 49 30, 55 20, 60 18 C 65 20, 71 30, 71 40 C 71 45, 65 65, 60 85 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      {/* Side petals */}
      <path d="M 60 85 C 42 80, 8 65, 8 46 C 8 36, 26 32, 41 37"    fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M 60 85 C 78 80, 112 65, 112 46 C 112 36, 94 32, 79 37" fill="none" stroke="currentColor" strokeWidth="0.8" />
      {/* Pond line */}
      <path d="M 35 88 Q 60 95 85 88" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Traditional Vietnamese cloud scroll divider (Vân Mây Cổ) */
export function CloudDivider({ className = "" }: { className?: string }) {
  const wave = (
    <svg viewBox="0 0 100 20" width="80" height="16">
      <path d="M 0 10 Q 20 20 40 10 T 80 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 20 10 Q 30 5 40 12"          fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="85" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        margin: "0.5rem 0",
        color: "var(--gold)",
        gap: "0.5rem",
      }}
    >
      <span style={{ transform: "scaleX(-1)", display: "inline-flex" }}>{wave}</span>
      <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", fontWeight: "bold" }}>★</span>
      {wave}
    </div>
  );
}
