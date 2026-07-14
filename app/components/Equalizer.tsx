"use client";

import { motion } from "framer-motion";

interface EqualizerProps {
  size?: number;
  color?: string;
}

export default function Equalizer({ size = 15, color = "currentColor" }: EqualizerProps) {
  // 4 dynamic bouncing bars
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: "2px",
        height: `${size}px`,
        width: `${size + 3}px`,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {[0.6, 1.1, 0.8, 1.3].map((duration, i) => (
        <motion.div
          key={i}
          style={{
            width: "2px",
            backgroundColor: color,
            borderRadius: "1px",
            height: "20%",
          }}
          animate={{
            height: ["20%", "100%", "20%"],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
