// src/app/(auth)/verify-email/page.tsx
import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="animate-slide-up" style={{ width: "100%", maxWidth: "420px" }}>
      <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center" }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(124, 58, 237, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          boxShadow: "0 0 30px -5px rgba(124, 58, 237, 0.25)",
        }}>
          <Mail size={28} style={{ color: "var(--color-primary-300)" }} />
        </div>

        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "0.75rem",
          fontFamily: "var(--font-display)",
        }}>
          Check your email
        </h1>
        <p style={{
          color: "var(--color-text-muted)",
          fontSize: "0.9rem",
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}>
          We sent a verification link to your email address.
          Click it to activate your account and start using UNIMIND.
        </p>

        <div style={{
          padding: "1rem",
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          marginBottom: "1.5rem",
        }}>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            Didn&apos;t get it? Check your spam folder, or{" "}
            <Link href="/register" style={{
              color: "var(--color-primary-300)",
              textDecoration: "none",
              fontWeight: 500,
            }}>
              try registering again
            </Link>
            .
          </p>
        </div>

        <Link
          href="/login"
          className="btn-primary"
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}