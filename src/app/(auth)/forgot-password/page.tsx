// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleReset(ev: React.FormEvent) {
    ev.preventDefault();
    if (!email) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    });

    if (resetError) {
      toast.error(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="animate-slide-up" style={{ width: "100%", maxWidth: "420px" }}>
      <div className="clay-card" style={{ padding: "2.5rem" }}>
        {!sent ? (
          <>
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>
                Reset your password
              </h1>
              <p style={{ color: "#78716c", fontSize: "0.875rem" }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#44403c", marginBottom: "0.375rem" }}>
                  Email address
                </label>
                <input
                  type="email"
                  className="clay-input"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                />
                {error && <p style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.375rem" }}>{error}</p>}
              </div>

              <button type="submit" className="btn-primary"
                style={{ width: "100%", padding: "0.75rem" }} disabled={loading}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
                  : <><Send size={16} /> Send Reset Link</>
                }
              </button>
            </form>

            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem",
                fontSize: "0.875rem", color: "#78716c", textDecoration: "none" }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📬</p>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.75rem" }}>
              Reset link sent!
            </h2>
            <p style={{ color: "#78716c", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Check your inbox at <strong>{email}</strong>. The link expires in 1 hour.
            </p>
            <Link href="/login" className="btn-secondary"
              style={{ display: "inline-flex" }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}