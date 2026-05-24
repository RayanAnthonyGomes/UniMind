// src/app/(auth)/verify-email/page.tsx
import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="animate-slide-up" style={{ width: "100%", maxWidth: "420px" }}>
      <div className="clay-card" style={{ padding: "2.5rem", textAlign: "center" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "var(--color-primary-50)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}>
          <Mail size={28} style={{ color: "var(--color-primary-600)" }} />
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.75rem" }}>
          Check your email
        </h1>
        <p style={{ color: "#78716c", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          We sent a verification link to your email address.
          Click it to activate your account and start using UNIMIND.
        </p>

        <div style={{
          padding: "1rem", background: "var(--color-surface-50)",
          borderRadius: "10px", border: "1px solid var(--color-surface-200)",
          marginBottom: "1.5rem",
        }}>
          <p style={{ fontSize: "0.8rem", color: "#78716c" }}>
            Didn't get it? Check your spam folder, or{" "}
            <Link href="/register" style={{ color: "var(--color-primary-600)", textDecoration: "none", fontWeight: 500 }}>
              try registering again
            </Link>
            .
          </p>
        </div>

        <Link href="/login" className="btn-primary" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}