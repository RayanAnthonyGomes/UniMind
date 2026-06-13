// src/components/ui/AnimatedIcon.tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedIconProps {
  children: ReactNode;
  animation?: "float" | "pulse" | "spin-slow" | "bounce" | "none";
  glowColor?: string;
  size?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

function getAnimateProps(animation: AnimatedIconProps["animation"]) {
  switch (animation) {
    case "float":
      return { animate: { y: [0, -8, 0] }, transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const } };
    case "pulse":
      return { animate: { scale: [1, 1.08, 1] }, transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const } };
    case "spin-slow":
      return { animate: { rotate: [0, 360] }, transition: { duration: 20, repeat: Infinity, ease: "linear" as const } };
    case "bounce":
      return { animate: { y: [0, -6, 0] }, transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const } };
    default:
      return { animate: {}, transition: {} };
  }
}

export default function AnimatedIcon({
  children,
  animation = "float",
  glowColor = "rgba(124, 58, 237, 0.3)",
  size = 48,
  delay = 0,
  className = "",
  style = {},
}: AnimatedIconProps) {
  const anim = getAnimateProps(animation);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, ...anim.animate }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay, type: "spring" as const, stiffness: 200 },
        ...anim.transition,
      }}
      whileHover={{
        scale: 1.15,
        transition: { duration: 0.2 },
      }}
      style={{
        width: size,
        height: size,
        borderRadius: "14px",
        background: "rgba(17, 17, 24, 0.5)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 25px -5px ${glowColor}`,
        cursor: "default",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
