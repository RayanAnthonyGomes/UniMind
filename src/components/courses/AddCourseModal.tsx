// src/components/courses/AddCourseModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";
import { COURSE_CATEGORIES, COURSE_COLORS, CREDIT_OPTIONS } from "@/lib/constants";

interface Props { open: boolean; onClose: () => void; currentSemester: number; userId: string; }
interface FormState { name: string; course_code: string; category: string; credits: string; semester: string; color: string; }

export default function AddCourseModal({ open, onClose, currentSemester, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<FormState>({
    name: "", course_code: "", category: "", credits: "3", semester: String(currentSemester), color: COURSE_COLORS[0]!,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormState, value: string) { setForm((p) => ({ ...p, [field]: value })); setErrors((p) => ({ ...p, [field]: "" })); }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Course name is required";
    if (!form.category) e.category = "Please select a category";
    if (!form.credits) e.credits = "Select credit hours";
    if (!form.semester) e.semester = "Select semester";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.from("courses").insert({
      user_id: userId, name: form.name.trim(), course_code: form.course_code.trim() || null,
      category: form.category, credits: parseFloat(form.credits), semester: parseInt(form.semester), color: form.color,
    });
    if (error) { toast.error("Failed to add course. Please try again."); setLoading(false); return; }
    toast.success(`"${form.name}" added! 📚`);
    setForm({ name: "", course_code: "", category: "", credits: "3", semester: String(currentSemester), color: COURSE_COLORS[0]! });
    setLoading(false); onClose(); router.refresh();
  }

  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(8px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="animate-slide-up"
        style={{
          width: "100%", maxWidth: "500px", padding: "2rem", maxHeight: "90vh", overflowY: "auto",
          background: "var(--color-surface-100)", borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 30px -5px rgba(124,58,237,0.1)",
        }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>Add New Course</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Fill in the details for your course</p>
          </div>
          <button onClick={onClose}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }} aria-label="Close">
            <X size={16} style={{ color: "var(--color-text-muted)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Color picker */}
          <div>
            <label style={labelStyle}>Course Color</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {COURSE_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => set("color", c)}
                  style={{
                    width: "28px", height: "28px", borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                    outline: form.color === c ? `3px solid ${c}` : "none", outlineOffset: "2px",
                    transform: form.color === c ? "scale(1.2)" : "scale(1)", transition: "all 0.15s",
                    boxShadow: form.color === c ? `0 0 12px ${c}60` : "none",
                  }} aria-label={`Select color ${c}`} />
              ))}
            </div>
          </div>

          <Field label="Course Name *" error={errors.name}>
            <input className="clay-input" placeholder="e.g. Data Structures & Algorithms" value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus />
          </Field>

          <Field label="Course Code (optional)">
            <input className="clay-input" placeholder="e.g. CSE-301" value={form.course_code} onChange={(e) => set("course_code", e.target.value)} />
          </Field>

          <Field label="Category *" error={errors.category}>
            <select className="clay-input" value={form.category} onChange={(e) => set("category", e.target.value)} style={{ cursor: "pointer" }}>
              <option value="">Select category...</option>
              {COURSE_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Credit Hours *" error={errors.credits}>
              <select className="clay-input" value={form.credits} onChange={(e) => set("credits", e.target.value)} style={{ cursor: "pointer" }}>
                {CREDIT_OPTIONS.map((c) => (<option key={c} value={c}>{c} credits</option>))}
              </select>
            </Field>
            <Field label="Semester *" error={errors.semester}>
              <select className="clay-input" value={form.semester} onChange={(e) => set("semester", e.target.value)} style={{ cursor: "pointer" }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (<option key={s} value={s}>Semester {s}</option>))}
              </select>
            </Field>
          </div>

          {/* Preview */}
          <div style={{ padding: "1rem", borderRadius: "10px", border: `2px solid ${form.color}30`, background: `${form.color}08`,
                        display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${form.color}20`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "1rem" }}>📚</span>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{form.name || "Course Name"}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{form.category || "Category"} · {form.credits} credits · Sem {form.semester}</p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Adding...</> : "Add Course 📚"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.375rem" }}>{error}</p>}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "0.375rem",
};