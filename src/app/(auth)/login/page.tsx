// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.email)                        e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)                     e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back! 👋");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="animate-slide-up" style={{ width: "100%", maxWidth: "420px" }}>
      <div className="clay-card" style={{ padding: "2.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>
            Welcome back
          </h1>
          <p style={{ color: "#78716c", fontSize: "0.9rem" }}>
            Sign in to your UNIMIND account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              className="clay-input"
              placeholder="you@university.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" style={errorStyle}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--color-primary-600)", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="clay-input"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                style={{ paddingRight: "3rem" }}
                aria-describedby={errors.password ? "pw-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "0.875rem", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", color: "#a8a29e", padding: 0,
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p id="pw-error" style={errorStyle}>{errors.password}</p>
            )}
          </div>

          {/* Stay signed in */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--color-primary-600)" }}
            />
            <span style={{ fontSize: "0.875rem", color: "#57534e" }}>Stay signed in</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem", fontSize: "0.9375rem" }}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</>
              : <><LogIn size={16} /> Sign In</>
            }
          </button>
        </form>

        {/* Register link */}
        <p style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.875rem", color: "#78716c" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#44403c",
  marginBottom: "0.375rem",
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--color-error)",
  marginTop: "0.375rem",
};