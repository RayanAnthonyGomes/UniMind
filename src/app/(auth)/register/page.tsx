// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Eye, EyeOff, Loader2, ChevronRight,
  ChevronLeft, User, GraduationCap, BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Degree options ──────────────────────────────────────────
const DEGREE_OPTIONS = [
  "BSc in Computer Science",
  "BSc in Software Engineering",
  "BSc in Electrical Engineering",
  "BSc in Mechanical Engineering",
  "BSc in Civil Engineering",
  "BSc in Business Administration",
  "BSc in Economics",
  "BSc in Mathematics",
  "BSc in Physics",
  "BSc in Chemistry",
  "BSc in Biology",
  "BSc in Psychology",
  "BSc in Sociology",
  "BSc in English Literature",
  "BSc in Law",
  "BSc in Architecture",
  "MSc in Computer Science",
  "MSc in Data Science",
  "MSc in Artificial Intelligence",
  "MSc in Business Administration (MBA)",
  "MSc in Electrical Engineering",
  "MSc in Mechanical Engineering",
  "MSc in Finance",
  "MSc in Economics",
  "Other",
];

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  university_name: string;
  degree_program: string;
  degree_search: string;
  current_semester: string;
  completed_semesters: string;
  semester_gpas: string[];
}

const stepSlide = {
  initial: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [degreeOpen, setDegreeOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    first_name: "", last_name: "", phone: "",
    email: "", password: "", confirm_password: "",
    university_name: "", degree_program: "", degree_search: "",
    current_semester: "", completed_semesters: "",
    semester_gpas: [],
  });

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleCompletedChange(val: string) {
    set("completed_semesters", val);
    const n = parseInt(val) || 0;
    setForm((prev) => ({
      ...prev,
      completed_semesters: val,
      semester_gpas: Array(n).fill("").map((_, i) => prev.semester_gpas[i] ?? ""),
    }));
  }

  // ── Validations ───────────────────────────────────────────
  function validateStep1() {
    const e: Record<string, string> = {};
    if (!form.first_name.trim())              e.first_name = "First name is required";
    if (!form.last_name.trim())               e.last_name  = "Last name is required";
    if (!form.email)                          e.email      = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email";
    if (!form.password)                       e.password   = "Password is required";
    else if (form.password.length < 8)        e.password   = "Minimum 8 characters";
    if (form.password !== form.confirm_password) e.confirm_password = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!form.university_name.trim())   e.university_name  = "University name is required";
    if (!form.degree_program)           e.degree_program   = "Please select your degree";
    if (!form.current_semester)         e.current_semester = "Required";
    else if (parseInt(form.current_semester) < 1) e.current_semester = "Must be at least 1";
    if (form.completed_semesters === "") e.completed_semesters = "Required (enter 0 if none)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3() {
    const e: Record<string, string> = {};
    form.semester_gpas.forEach((g, i) => {
      const v = parseFloat(g);
      if (g === "")            e[`gpa_${i}`] = "Required";
      else if (isNaN(v))       e[`gpa_${i}`] = "Must be a number";
      else if (v < 0 || v > 4) e[`gpa_${i}`] = "Between 0.00 – 4.00";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setDirection(1);
    setStep((s) => s + 1);
  }

  function prevStep() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const completed = parseInt(form.completed_semesters) || 0;
    if (completed > 0 && !validateStep3()) return;
    setLoading(true);

    const gpas = form.semester_gpas.map((g) => parseFloat(g)).filter(Boolean);
    const cgpa = gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0;

    const { data, error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.first_name.trim(),
          last_name:  form.last_name.trim(),
        },
        emailRedirectTo: "https://unimind-omega.vercel.app/auth/callback?next=/login",
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          phone:               form.phone || null,
          university_name:     form.university_name.trim(),
          degree_program:      form.degree_program,
          current_semester:    parseInt(form.current_semester),
          completed_semesters: completed,
          current_cgpa:        Math.round(cgpa * 100) / 100,
        })
        .eq("id", data.user.id);

      if (profileError) console.error("Profile update error:", profileError);

      if (gpas.length > 0) {
        const gpaRows = form.semester_gpas.map((g, i) => ({
          user_id:  data.user!.id,
          semester: i + 1,
          sgpa:     parseFloat(g),
        }));
        await supabase.from("semester_gpas").insert(gpaRows);
      }

      await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:     form.email,
          firstName: form.first_name.trim(),
        }),
      });
    }

    toast.success("Account created! Check your email to verify. 📧");
    router.push("/verify-email");
  }

  const filteredDegrees = DEGREE_OPTIONS.filter((d) =>
    d.toLowerCase().includes(form.degree_search.toLowerCase())
  );

  const steps = [
    { n: 1, label: "Personal", icon: <User size={14} /> },
    { n: 2, label: "University", icon: <GraduationCap size={14} /> },
    { n: 3, label: "Grades", icon: <BookOpen size={14} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 90, damping: 18 }}
      style={{ width: "100%", maxWidth: "480px" }}
    >
      <div className="glass-card" style={{ padding: "2.5rem" }}>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", gap: "0" }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                <motion.div
                  animate={{
                    background: step >= s.n
                      ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                      : "rgba(255, 255, 255, 0.06)",
                    boxShadow: step >= s.n
                      ? "0 0 20px -3px rgba(124, 58, 237, 0.4)"
                      : "none",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    color: step >= s.n ? "white" : "var(--color-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    border: step >= s.n ? "none" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {step > s.n ? "✓" : s.n}
                </motion.div>
                <span style={{
                  fontSize: "0.7rem",
                  color: step >= s.n ? "var(--color-primary-300)" : "var(--color-text-muted)",
                  fontWeight: 500,
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ position: "relative", width: "60px", height: "2px", marginBottom: "1rem" }}>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255, 255, 255, 0.06)",
                    borderRadius: "999px",
                  }} />
                  <motion.div
                    animate={{ width: step > s.n ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      background: "linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))",
                      borderRadius: "999px",
                      boxShadow: "0 0 8px rgba(124, 58, 237, 0.4)",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <AnimatePresence mode="wait" custom={direction}>

            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepSlide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}
              >
                <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
                    Personal Information
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Let&apos;s start with the basics</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <Field label="First Name" error={errors.first_name}>
                    <input className="clay-input" placeholder="Rayan" value={form.first_name}
                      onChange={(e) => set("first_name", e.target.value)} autoComplete="given-name" />
                  </Field>
                  <Field label="Last Name" error={errors.last_name}>
                    <input className="clay-input" placeholder="Chuntu" value={form.last_name}
                      onChange={(e) => set("last_name", e.target.value)} autoComplete="family-name" />
                  </Field>
                </div>

                <Field label="Phone Number (optional)">
                  <input className="clay-input" placeholder="+880 1XXX XXXXXX" value={form.phone}
                    onChange={(e) => set("phone", e.target.value)} autoComplete="tel" type="tel" />
                </Field>

                <Field label="Email Address" error={errors.email}>
                  <input className="clay-input" placeholder="you@university.edu" value={form.email}
                    onChange={(e) => set("email", e.target.value)} autoComplete="email" type="email" />
                </Field>

                <Field label="Password" error={errors.password}>
                  <div style={{ position: "relative" }}>
                    <input className="clay-input" placeholder="Minimum 8 characters"
                      type={showPassword ? "text" : "password"}
                      value={form.password} onChange={(e) => set("password", e.target.value)}
                      style={{ paddingRight: "3rem" }} autoComplete="new-password" />
                    <ToggleEye show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                  </div>
                </Field>

                <Field label="Confirm Password" error={errors.confirm_password}>
                  <div style={{ position: "relative" }}>
                    <input className="clay-input" placeholder="Repeat your password"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirm_password} onChange={(e) => set("confirm_password", e.target.value)}
                      style={{ paddingRight: "3rem" }} autoComplete="new-password" />
                    <ToggleEye show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                  </div>
                </Field>

                <motion.button
                  type="button"
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
                  onClick={nextStep}
                >
                  Continue <ChevronRight size={16} />
                </motion.button>

                <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  Already have an account?{" "}
                  <Link href="/login" style={{ color: "var(--color-primary-300)", fontWeight: 600, textDecoration: "none" }}>
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: University Info ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepSlide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}
              >
                <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
                    University Information
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Tell us about your studies</p>
                </div>

                <Field label="University Name" error={errors.university_name}>
                  <input className="clay-input" placeholder="e.g. Daffodil International University"
                    value={form.university_name} onChange={(e) => set("university_name", e.target.value)} />
                </Field>

                {/* Degree dropdown */}
                <Field label="Degree Program" error={errors.degree_program}>
                  <div style={{ position: "relative" }}>
                    <div
                      className="clay-input"
                      onClick={() => setDegreeOpen(!degreeOpen)}
                      style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <span style={{ color: form.degree_program ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
                        {form.degree_program || "Select your degree..."}
                      </span>
                      <ChevronRight
                        size={14}
                        style={{
                          transform: degreeOpen ? "rotate(90deg)" : "none",
                          transition: "0.2s",
                          color: "var(--color-text-muted)",
                        }}
                      />
                    </div>

                    <AnimatePresence>
                      {degreeOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            right: 0,
                            zIndex: 50,
                            background: "var(--color-surface-150)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 30px -5px rgba(124,58,237,0.15)",
                            overflow: "hidden",
                          }}
                        >
                          <div style={{ padding: "0.5rem" }}>
                            <input
                              className="clay-input"
                              placeholder="Search degrees..."
                              value={form.degree_search}
                              onChange={(e) => setForm((p) => ({ ...p, degree_search: e.target.value }))}
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: "0.8125rem" }}
                              autoFocus
                            />
                          </div>
                          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                            {filteredDegrees.map((d) => (
                              <div
                                key={d}
                                onClick={() => { set("degree_program", d); setDegreeOpen(false); setForm((p) => ({ ...p, degree_search: "" })); }}
                                style={{
                                  padding: "0.625rem 1rem",
                                  cursor: "pointer",
                                  fontSize: "0.875rem",
                                  background: form.degree_program === d ? "rgba(124, 58, 237, 0.12)" : "transparent",
                                  color: form.degree_program === d ? "var(--color-primary-300)" : "var(--color-text-secondary)",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = form.degree_program === d ? "rgba(124, 58, 237, 0.12)" : "transparent")}
                              >
                                {d}
                              </div>
                            ))}
                            {filteredDegrees.length === 0 && (
                              <p style={{ padding: "1rem", color: "var(--color-text-muted)", fontSize: "0.875rem", textAlign: "center" }}>
                                No matches. Try different keywords.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <Field label="Current Semester" error={errors.current_semester}>
                    <input className="clay-input" type="number" min={1} max={16} placeholder="e.g. 4"
                      value={form.current_semester} onChange={(e) => set("current_semester", e.target.value)} />
                  </Field>
                  <Field label="Semesters Completed" error={errors.completed_semesters}>
                    <input className="clay-input" type="number" min={0} max={16} placeholder="e.g. 3"
                      value={form.completed_semesters} onChange={(e) => handleCompletedChange(e.target.value)} />
                  </Field>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 1, padding: "0.75rem" }}
                    onClick={prevStep}
                  >
                    <ChevronLeft size={16} /> Back
                  </motion.button>
                  <motion.button
                    type="button"
                    className="btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 1, padding: "0.75rem" }}
                    onClick={nextStep}
                  >
                    Continue <ChevronRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Semester GPAs ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={stepSlide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}
              >
                <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
                    Your Grades So Far
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                    {form.completed_semesters === "0" || form.completed_semesters === ""
                      ? "No completed semesters — you're just getting started! 🎉"
                      : "Enter your SGPA for each completed semester"}
                  </p>
                </div>

                {form.semester_gpas.length === 0 ? (
                  <div style={{
                    padding: "2rem",
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "12px",
                    border: "1px dashed rgba(255, 255, 255, 0.08)",
                  }}>
                    <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎓</p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                      Your CGPA journey starts now. We&apos;ll track everything from here!
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {form.semester_gpas.map((gpa, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                          <span style={{
                            minWidth: "90px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "var(--color-text-secondary)",
                            background: "rgba(255, 255, 255, 0.04)",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "8px",
                            textAlign: "center",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}>
                            Sem {i + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            <input
                              className="clay-input"
                              type="number"
                              step="0.01"
                              min="0"
                              max="4"
                              placeholder="e.g. 3.75"
                              value={gpa}
                              onChange={(e) => {
                                const updated = [...form.semester_gpas];
                                updated[i] = e.target.value;
                                setForm((p) => ({ ...p, semester_gpas: updated }));
                                setErrors((p) => ({ ...p, [`gpa_${i}`]: "" }));
                              }}
                            />
                            {errors[`gpa_${i}`] && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem" }}
                              >
                                {errors[`gpa_${i}`]}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live CGPA preview */}
                    {form.semester_gpas.some((g) => g !== "") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          padding: "1rem",
                          background: "rgba(124, 58, 237, 0.08)",
                          borderRadius: "12px",
                          border: "1px solid rgba(124, 58, 237, 0.15)",
                          textAlign: "center",
                          boxShadow: "0 0 20px -5px rgba(124, 58, 237, 0.15)",
                        }}
                      >
                        <p style={{ fontSize: "0.8rem", color: "var(--color-primary-300)", marginBottom: "0.25rem" }}>
                          Current CGPA (auto-calculated)
                        </p>
                        <p style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                          <span className="text-gradient">
                            {(() => {
                              const vals = form.semester_gpas.map((g) => parseFloat(g)).filter((v) => !isNaN(v));
                              return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "—";
                            })()}
                          </span>
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>This field is locked and auto-updated</p>
                      </motion.div>
                    )}
                  </>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 1, padding: "0.75rem" }}
                    onClick={prevStep}
                  >
                    <ChevronLeft size={16} /> Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    style={{ flex: 1, padding: "0.75rem" }}
                    disabled={loading}
                  >
                    {loading
                      ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating...</>
                      : "Create Account 🎉"
                    }
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  );
}

// ── Small reusable components ─────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: "block",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        marginBottom: "0.375rem",
      }}>
        {label}
      </label>
      {children}
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
  );
}

function ToggleEye({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "absolute",
        right: "0.875rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--color-text-muted)",
        padding: 0,
        transition: "color 0.2s",
      }}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}