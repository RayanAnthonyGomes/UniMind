// src/components/dashboard/DashboardCards.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Card {
  label:   string;
  value:   string | number;
  icon:    React.ReactNode;
  color:   string;
  bg:      string;
  sub:     string;
  href?:   string;
  glow?:   string;
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 16 },
  },
};

export default function DashboardCards({ cards }: { cards: Card[] }) {
  return (
    <motion.div
      className="dashboard-cards"
      variants={container}
      initial="hidden"
      animate="visible"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {cards.map((card) => {
        const inner = (
          <motion.div
            variants={item}
            whileHover={{
              y: -4,
              boxShadow: `0 0 40px -8px ${card.glow ?? card.color}40`,
              borderColor: "rgba(255, 255, 255, 0.10)",
            }}
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              background: "rgba(17, 17, 24, 0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.3)",
              cursor: card.href ? "pointer" : "default",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
          >
            {/* Icon */}
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: `linear-gradient(135deg, ${card.color}18, ${card.color}08)`,
              border: `1px solid ${card.color}22`,
              color: card.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1rem",
              boxShadow: `0 0 18px -4px ${card.color}30`,
            }}>
              {card.icon}
            </div>

            {/* Value */}
            <p style={{
              fontSize: "2rem", fontWeight: 700,
              lineHeight: 1, marginBottom: "0.375rem",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
              background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {card.value}
            </p>

            {/* Label */}
            <p style={{
              fontSize: "0.875rem", fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "0.25rem",
            }}>
              {card.label}
            </p>

            {/* Sub */}
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              {card.sub}
            </p>
          </motion.div>
        );

        return card.href ? (
          <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
            {inner}
          </Link>
        ) : (
          <div key={card.label}>{inner}</div>
        );
      })}
    </motion.div>
  );
}