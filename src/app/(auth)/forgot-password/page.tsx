// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Send, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 90, damping: 18 }}
      style={{ width: "100%", maxWidth: "420px" }}
    >
      <div className="glass-card" style={{ padding: "2.5rem" }}>
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                  fontFamily: "var(--font-display)",
                }}>
                  Reset your password
                </h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.375rem",
                  }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    className="clay-input"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.375rem" }}
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  className="btn-primary"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  style={{ width: "100%", padding: "0.75rem" }}
                  disabled={loading}
                >
                  {loading
                    ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
                    : <><Send size={16} /> Send Reset Link</>
                  }
                </motion.button>
              </form>

              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              style={{ textAlign: "center" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(124, 58, 237, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: "0 0 30px -5px rgba(124, 58, 237, 0.25)",
                }}
              >
                <Mail size={28} style={{ color: "var(--color-primary-300)" }} />
              </motion.div>
              <h2 style={{
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
                fontFamily: "var(--font-display)",
              }}>
                Reset link sent!
              </h2>
              <p style={{
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}>
                Check your inbox at <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>. The link expires in 1 hour.
              </p>
              <Link href="/login">
                <motion.button
                  className="btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ display: "inline-flex" }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}