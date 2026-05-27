// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem", textAlign: "center",
      background: "var(--color-surface-50)",
    }}>
      <p style={{ fontSize: "5rem", marginBottom: "1rem" }}>📚</p>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>
        Page not found
      </h1>
      <p style={{ color: "#78716c", marginBottom: "2rem", maxWidth: "360px", lineHeight: 1.6 }}>
        Looks like this page took the day off. Let's get you back on track.
      </p>
      <Link href="/dashboard" className="btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 2rem" }}>
        Back to Dashboard
      </Link>
    </div>
  );
}