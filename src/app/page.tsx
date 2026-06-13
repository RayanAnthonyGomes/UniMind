// src/app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, Bot, BarChart2, CheckSquare, PenTool, Sparkles,
  ArrowRight, Zap,
} from "lucide-react";

const features = [
  {
    icon: <BookOpen size={22} />,
    label: "Course Tracker",
    desc: "Organize courses, upload materials & never lose a file",
    color: "#818cf8",
    glow: "rgba(129, 140, 248, 0.3)",
    animation: "float" as const,
  },
  {
    icon: <Bot size={22} />,
    label: "AI Assistant",
    desc: "Get instant answers from your uploaded course materials",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.3)",
    animation: "pulse" as const,
  },
  {
    icon: <BarChart2 size={22} />,
    label: "CGPA Calculator",
    desc: "Track grades, predict SGPA & visualize your progress",
    color: "#34d399",
    glow: "rgba(52, 211, 153, 0.3)",
    animation: "float" as const,
  },
  {
    icon: <CheckSquare size={22} />,
    label: "Task Manager",
    desc: "Stay on top of assignments, deadlines & priorities",
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.3)",
    animation: "bounce" as const,
  },
  {
    icon: <PenTool size={22} />,
    label: "Drawing Board",
    desc: "Sketch ideas, take visual notes & solve problems",
    color: "#f472b6",
    glow: "rgba(244, 114, 182, 0.3)",
    animation: "float" as const,
  },
  {
    icon: <Sparkles size={22} />,
    label: "Motivation Hub",
    desc: "AI pep talks, study techniques & mood tracking",
    color: "#fb923c",
    glow: "rgba(251, 146, 60, 0.3)",
    animation: "pulse" as const,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Aurora background */}
      <div className="aurora-bg" />

      {/* Grain overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "800px" }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #818cf8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 40px -5px rgba(124, 58, 237, 0.5)",
              }}
            >
              <span style={{ color: "white", fontWeight: 700, fontSize: "1.5rem", fontFamily: "var(--font-display)" }}>
                U
              </span>
            </motion.div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "2rem",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.03em",
                color: "var(--color-text-primary)",
              }}
            >
              Uni<span className="text-gradient">Mind</span>
            </span>
          </div>
        </motion.div>

        {/* Hero text */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, type: "spring", stiffness: 80 }}
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.04em",
            }}
          >
            Your University Life,{" "}
            <br />
            <span className="text-gradient">Organized.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              fontSize: "1.15rem",
              color: "var(--color-text-secondary)",
              maxWidth: "540px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            Track courses, manage grades, get AI-powered help, and never fall
            behind again. Built for students, free forever.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/register">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  fontSize: "1rem",
                  padding: "0.875rem 2rem",
                }}
              >
                Get Started Free <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  fontSize: "1rem",
                  padding: "0.875rem 2rem",
                }}
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Feature grid — bento layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            maxWidth: "720px",
            margin: "0 auto",
          }}
        >
          {features.map((f) => (
            <motion.div
              key={f.label}
              variants={itemVariants}
              whileHover={{
                scale: 1.04,
                borderColor: "rgba(255, 255, 255, 0.12)",
                boxShadow: `0 0 35px -5px ${f.glow}`,
              }}
              style={{
                padding: "1.5rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(17, 17, 24, 0.5)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                cursor: "default",
                transition: "all 0.3s ease",
              }}
            >
              <motion.div
                animate={{
                  y: f.animation === "float" ? [0, -5, 0] : undefined,
                  scale: f.animation === "pulse" ? [1, 1.1, 1] : undefined,
                }}
                transition={{
                  duration: f.animation === "float" ? 4 : 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${f.color}20, ${f.color}08)`,
                  border: `1px solid ${f.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.color,
                  marginBottom: "1rem",
                  boxShadow: `0 0 20px -5px ${f.glow}`,
                }}
              >
                {f.icon}
              </motion.div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.375rem",
                  fontFamily: "var(--font-display)",
                }}
              >
                {f.label}
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trusted badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "3.5rem",
          }}
        >
          <Zap size={14} style={{ color: "var(--color-accent-400)" }} />
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-muted)",
              letterSpacing: "0.02em",
            }}
          >
            Free forever for students · No credit card required
          </p>
        </motion.div>
      </div>

      {/* Responsive grid fix for mobile */}
      <style>{`
        @media (max-width: 640px) {
          main > div > div:nth-child(4) {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 400px) {
          main > div > div:nth-child(4) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}