// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--color-surface-0)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Aurora background */}
      <div className="aurora-bg" />

      {/* Logo top-left */}
      <div style={{ position: "fixed", top: "1.5rem", left: "1.5rem", zIndex: 10 }}>
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 25px -5px rgba(124, 58, 237, 0.4)",
            }}
          >
            <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>U</span>
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            UNI<span className="text-gradient">MIND</span>
          </span>
        </a>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}