"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error: any;
  resetErrorBoundary: () => void;
  componentName?: string;
}

export default function ErrorFallback({ error, resetErrorBoundary, componentName }: ErrorFallbackProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        gap: "1rem",
        backgroundColor: "var(--background)",
        border: "1px dashed #EADFCE",
        borderRadius: "12px",
        minHeight: "200px",
      }}
    >
      <AlertTriangle size={36} color="#9B1C26" strokeWidth={1.5} />
      <div>
        <p style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
          {componentName ? `Lỗi tại ${componentName}` : "Đã có lỗi xảy ra"}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", maxWidth: "320px", lineHeight: 1.5 }}>
          Vui lòng thử tải lại thành phần này. Nếu vấn đề vẫn tiếp diễn, hãy tải lại toàn trang.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p style={{ color: "#9B1C26", fontSize: "0.72rem", marginTop: "0.5rem", fontFamily: "monospace", maxWidth: "380px", wordBreak: "break-word" }}>
            {error.message}
          </p>
        )}
      </div>
      <button
        onClick={resetErrorBoundary}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          backgroundColor: "var(--primary-red)",
          color: "#FFF",
          border: "none",
          borderRadius: "999px",
          padding: "0.55rem 1.4rem",
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <RefreshCw size={13} /> Thử lại
      </button>
    </div>
  );
}
