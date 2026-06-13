// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem", textAlign: "center",
      background: "var(--color-background)",
    }}>
      <div className="glass-card-static" style={{
        padding: "3rem",
        display: "flex", flexDirection: "column",
        alignItems: "center",
        maxWidth: "400px",
        width: "100%",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}>
        <p style={{ fontSize: "5rem", marginBottom: "1rem", animation: "float 6s ease-in-out infinite" }}>📚</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)", marginBottom: "0.5rem" }}>
          Page not found
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem", maxWidth: "360px", lineHeight: 1.6 }}>
          Looks like this page took the day off. Let's get you back on track.
        </p>
        <Link href="/dashboard" className="btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 2rem", width: "100%" }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}