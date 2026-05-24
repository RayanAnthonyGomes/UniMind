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
  // Step 1
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  // Step 2
  university_name: string;
  degree_program: string;
  degree_search: string;
  current_semester: string;
  completed_semesters: string;
  // Step 3 — dynamic SGPA fields
  semester_gpas: string[];
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
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

  // ── Field updater ─────────────────────────────────────────
  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  // ── When completed_semesters changes, resize the gpas array ─
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

  // ── Step navigation ───────────────────────────────────────
  function nextStep() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const completed = parseInt(form.completed_semesters) || 0;
    if (completed > 0 && !validateStep3()) return;
    setLoading(true);

    // Calculate current CGPA from entered SGPAs
    const gpas = form.semester_gpas.map((g) => parseFloat(g)).filter(Boolean);
    const cgpa = gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0;

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.first_name.trim(),
          last_name:  form.last_name.trim(),
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Update profile with full details
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

      // Insert semester GPAs
      if (gpas.length > 0) {
        const gpaRows = form.semester_gpas.map((g, i) => ({
          user_id:  data.user!.id,
          semester: i + 1,
          sgpa:     parseFloat(g),
        }));
        await supabase.from("semester_gpas").insert(gpaRows);
      }

      // Send verification email via our API route
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

  // ── Filtered degree list ──────────────────────────────────
  const filteredDegrees = DEGREE_OPTIONS.filter((d) =>
    d.toLowerCase().includes(form.degree_search.toLowerCase())
  );

  // ── Step indicator ────────────────────────────────────────
  const steps = [
    { n: 1, label: "Personal", icon: <User size={14} /> },
    { n: 2, label: "University", icon: <GraduationCap size={14} /> },
    { n: 3, label: "Grades", icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="animate-slide-up" style={{ width: "100%", maxWidth: "480px" }}>
      <div className="clay-card" style={{ padding: "2.5rem" }}>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", gap: "0" }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: step >= s.n ? "var(--color-primary-600)" : "var(--color-surface-200)",
                  color: step >= s.n ? "white" : "#a8a29e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: "0.8rem",
                  transition: "all 0.3s ease",
                }}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span style={{ fontSize: "0.7rem", color: step >= s.n ? "var(--color-primary-600)" : "#a8a29e", fontWeight: 500 }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: "60px", height: "2px", marginBottom: "1rem",
                  background: step > s.n ? "var(--color-primary-400)" : "var(--color-surface-200)",
                  transition: "all 0.3s ease",
                }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#1c1917" }}>Personal Information</h2>
                <p style={{ color: "#78716c", fontSize: "0.875rem" }}>Let's start with the basics</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <Field label="First Name" error={errors.first_name}>
                  <input className="clay-input" placeholder="Rahim" value={form.first_name}
                    onChange={(e) => set("first_name", e.target.value)} autoComplete="given-name" />
                </Field>
                <Field label="Last Name" error={errors.last_name}>
                  <input className="clay-input" placeholder="Chowdhury" value={form.last_name}
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

              <button type="button" className="btn-primary"
                style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
                onClick={nextStep}>
                Continue <ChevronRight size={16} />
              </button>

              <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#78716c" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: University Info ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#1c1917" }}>University Information</h2>
                <p style={{ color: "#78716c", fontSize: "0.875rem" }}>Tell us about your studies</p>
              </div>

              <Field label="University Name" error={errors.university_name}>
                <input className="clay-input" placeholder="e.g. BRAC University"
                  value={form.university_name} onChange={(e) => set("university_name", e.target.value)} />
              </Field>

              {/* Degree dropdown with search */}
              <Field label="Degree Program" error={errors.degree_program}>
                <div style={{ position: "relative" }}>
                  <div
                    className="clay-input"
                    onClick={() => setDegreeOpen(!degreeOpen)}
                    style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span style={{ color: form.degree_program ? "#1c1917" : "#a8a29e" }}>
                      {form.degree_program || "Select your degree..."}
                    </span>
                    <ChevronRight size={14} style={{ transform: degreeOpen ? "rotate(90deg)" : "none", transition: "0.2s", color: "#a8a29e" }} />
                  </div>

                  {degreeOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                      background: "white", borderRadius: "10px", border: "1px solid var(--color-surface-200)",
                      boxShadow: "var(--shadow-clay-md)", overflow: "hidden",
                    }}>
                      <div style={{ padding: "0.5rem" }}>
                        <input className="clay-input" placeholder="Search degrees..."
                          value={form.degree_search}
                          onChange={(e) => setForm((p) => ({ ...p, degree_search: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: "0.8125rem" }}
                          autoFocus />
                      </div>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {filteredDegrees.map((d) => (
                          <div key={d}
                            onClick={() => { set("degree_program", d); setDegreeOpen(false); setForm((p) => ({ ...p, degree_search: "" })); }}
                            style={{
                              padding: "0.625rem 1rem", cursor: "pointer", fontSize: "0.875rem",
                              background: form.degree_program === d ? "var(--color-primary-50)" : "transparent",
                              color: form.degree_program === d ? "var(--color-primary-700)" : "#44403c",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-100)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = form.degree_program === d ? "var(--color-primary-50)" : "transparent")}
                          >
                            {d}
                          </div>
                        ))}
                        {filteredDegrees.length === 0 && (
                          <p style={{ padding: "1rem", color: "#a8a29e", fontSize: "0.875rem", textAlign: "center" }}>
                            No matches. Try different keywords.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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
                <button type="button" className="btn-secondary"
                  style={{ flex: 1, padding: "0.75rem" }} onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="button" className="btn-primary"
                  style={{ flex: 1, padding: "0.75rem" }} onClick={nextStep}>
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Semester GPAs ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#1c1917" }}>Your Grades So Far</h2>
                <p style={{ color: "#78716c", fontSize: "0.875rem" }}>
                  {form.completed_semesters === "0" || form.completed_semesters === ""
                    ? "No completed semesters — you're just getting started! 🎉"
                    : `Enter your SGPA for each completed semester`}
                </p>
              </div>

              {form.semester_gpas.length === 0 ? (
                <div style={{
                  padding: "2rem", textAlign: "center", background: "var(--color-surface-50)",
                  borderRadius: "12px", border: "1px dashed var(--color-surface-300)",
                }}>
                  <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎓</p>
                  <p style={{ color: "#78716c", fontSize: "0.9rem" }}>
                    Your CGPA journey starts now. We'll track everything from here!
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {form.semester_gpas.map((gpa, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                        <span style={{
                          minWidth: "90px", fontSize: "0.875rem", fontWeight: 500, color: "#44403c",
                          background: "var(--color-surface-100)", padding: "0.5rem 0.75rem",
                          borderRadius: "8px", textAlign: "center",
                        }}>
                          Sem {i + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <input
                            className="clay-input"
                            type="number" step="0.01" min="0" max="4"
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
                            <p style={{ fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem" }}>
                              {errors[`gpa_${i}`]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live CGPA preview */}
                  {form.semester_gpas.some((g) => g !== "") && (
                    <div style={{
                      padding: "1rem", background: "var(--color-primary-50)",
                      borderRadius: "10px", border: "1px solid var(--color-primary-100)",
                      textAlign: "center",
                    }}>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-primary-600)", marginBottom: "0.25rem" }}>
                        Current CGPA (auto-calculated)
                      </p>
                      <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary-700)" }}>
                        {(() => {
                          const vals = form.semester_gpas.map((g) => parseFloat(g)).filter((v) => !isNaN(v));
                          return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "—";
                        })()}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#78716c" }}>This field is locked and auto-updated</p>
                    </div>
                  )}
                </>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary"
                  style={{ flex: 1, padding: "0.75rem" }} onClick={() => setStep(2)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" className="btn-primary"
                  style={{ flex: 1, padding: "0.75rem" }} disabled={loading}>
                  {loading
                    ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating...</>
                    : "Create Account 🎉"
                  }
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Small reusable components ─────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#44403c", marginBottom: "0.375rem" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.375rem" }}>{error}</p>}
    </div>
  );
}

function ToggleEye({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)",
               background: "none", border: "none", cursor: "pointer", color: "#a8a29e", padding: 0 }}
      aria-label={show ? "Hide password" : "Show password"}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}