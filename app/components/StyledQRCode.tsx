"use client";

import { useEffect, useRef } from "react";

interface StyledQRCodeProps {
  value: string;
  size?: number;
  logo?: string;
}

export default function StyledQRCode({ value, size = 100, logo }: StyledQRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Dynamically import to prevent SSR errors
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      const qrCode = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data: value,
        image: logo || "/logo_doan_xa.webp",
        dotsOptions: {
          color: "#9B1C26", // var(--primary-red)
          type: "rounded"
        },
        backgroundOptions: {
          color: "#FFFFFF",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 3,
          imageSize: 0.35
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#9B1C26"
        },
        cornersDotOptions: {
          type: "dot",
          color: "#9B1C26"
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        qrCode.append(containerRef.current);
      }
    });
  }, [value, size, logo]);

  return <div ref={containerRef} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size }} />;
}
