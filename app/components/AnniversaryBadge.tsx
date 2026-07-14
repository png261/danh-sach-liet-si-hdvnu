"use client";

import { getAnniversaryInfo } from "@/app/utils/anniversary";

interface AnniversaryBadgeProps {
  deathDate?: string | null;
}

export default function AnniversaryBadge({ deathDate }: AnniversaryBadgeProps) {
  const info = getAnniversaryInfo(deathDate);
  if (!info) return null;

  if (info.isToday) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          backgroundColor: "#9B1C26",
          color: "#FFF",
          padding: "0.35rem 0.9rem",
          borderRadius: "999px",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.02em",
          animation: "pulse-glow 1.8s ease-in-out infinite",
          marginTop: "0.5rem",
        }}
      >
        🕯️ Hôm nay là ngày giỗ
      </div>
    );
  }

  if (info.daysLeft <= 30) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          backgroundColor: "rgba(155, 28, 38, 0.08)",
          color: "#9B1C26",
          border: "1px solid rgba(155, 28, 38, 0.25)",
          padding: "0.3rem 0.8rem",
          borderRadius: "999px",
          fontSize: "0.76rem",
          fontWeight: 600,
          marginTop: "0.5rem",
        }}
      >
        🕯️ Ngày giỗ còn {info.daysLeft} ngày nữa
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        backgroundColor: "rgba(164, 123, 46, 0.08)",
        color: "var(--gold)",
        border: "1px solid rgba(164, 123, 46, 0.2)",
        padding: "0.28rem 0.75rem",
        borderRadius: "999px",
        fontSize: "0.74rem",
        fontWeight: 600,
        marginTop: "0.5rem",
      }}
    >
      🗓️ Ngày giỗ còn {info.daysLeft} ngày ({info.nextAnniversaryYear})
    </div>
  );
}
