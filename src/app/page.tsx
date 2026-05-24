// src/app/page.tsx
import Link from "next/link";

const features = [
  { icon: "📚", label: "Course Tracker" },
  { icon: "🤖", label: "AI Assistant" },
  { icon: "📊", label: "CGPA Calculator" },
  { icon: "✅", label: "Task Manager" },
  { icon: "✏️", label: "Drawing Board" },
  { icon: "💪", label: "Motivation Hub" },
];

export default function HomePage() {
  return (
    <main
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
               alignItems: "center", justifyContent: "center", padding: "2rem" }}
    >
      {/* Logo */}
      <div className="animate-fade-in" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "48px", height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-clay)",
            }}
          >
            <span style={{ color: "white", fontWeight: 700, fontSize: "1.25rem" }}>U</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.75rem", color: "#1c1917", letterSpacing: "-0.03em" }}>
            UNI<span style={{ color: "var(--color-primary-600)" }}>MIND</span>
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="animate-slide-up" style={{ textAlign: "center", maxWidth: "640px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 700,
                     color: "#1c1917", marginBottom: "1rem", lineHeight: 1.15 }}>
          Your University Life,{" "}
          <span style={{ color: "var(--color-primary-600)" }}>Organized.</span>
        </h1>
        <p style={{ fontSize: "1.125rem", color: "#78716c", marginBottom: "2rem", lineHeight: 1.6 }}>
          Track courses, manage grades, get AI-powered help, and never fall behind again.
          Built for students, free forever.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Get Started Free
          </Link>
          <Link href="/login" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Feature chips */}
      <div
        className="animate-fade-in"
        style={{ marginTop: "4rem", display: "flex", flexWrap: "wrap",
                 gap: "0.75rem", justifyContent: "center", maxWidth: "600px" }}
      >
        {features.map((f) => (
          <span
            key={f.label}
            className="clay-badge"
            style={{
              background: "white",
              border: "1px solid var(--color-surface-200)",
              color: "#57534e",
              padding: "0.5rem 1rem",
              boxShadow: "var(--shadow-clay-sm)",
            }}
          >
            {f.icon} {f.label}
          </span>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ marginTop: "4rem", fontSize: "0.875rem", color: "#a8a29e" }}>
        Free forever for students · No credit card required
      </p>
    </main>
  );
}