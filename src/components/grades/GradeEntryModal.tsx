// src/components/grades/GradeEntryModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { gradePoint, letterGrade, gradeColor } from "@/lib/utils";
import type { Course } from "@/types";

interface Grade {
  id:           string;
  course_id:    string;
  quiz_marks:   number[];
  midterm_mark: number | null;
  final_mark:   number | null;
  attendance:   number | null;
  assignment?:  number | null;
  presentation?:number | null;
  sgpa:         number | null;
}

interface Props {
  course:        Course;
  existingGrade: Grade | null;
  userId:        string;
  onClose:       () => void;
}

export default function GradeEntryModal({ course, existingGrade, userId, onClose }: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const [quizMarks,    setQuizMarks]    = useState<string[]>(existingGrade?.quiz_marks?.map(String) ?? [""]);
  const [midterm,      setMidterm]      = useState<string>(existingGrade?.midterm_mark?.toString() ?? "");
  const [final,        setFinal]        = useState<string>(existingGrade?.final_mark?.toString()   ?? "");
  const [attendance,   setAttendance]   = useState<string>(existingGrade?.attendance?.toString()   ?? "");
  const [assignment,   setAssignment]   = useState<string>(existingGrade?.assignment?.toString()   ?? "");
  const [presentation, setPresentation] = useState<string>(existingGrade?.presentation?.toString() ?? "");
  const [loading,      setLoading]      = useState(false);

  // Calculation
  const totalCalculatedMarks = (() => {
    const validQuizzes = quizMarks.map(Number).filter((v) => !isNaN(v) && v >= 0);
    let quizContribution = 0;
    if (validQuizzes.length > 0) {
      const quizSum = validQuizzes.reduce((a, b) => a + b, 0);
      quizContribution = quizSum / validQuizzes.length;
    }

    const att = parseFloat(attendance) || 0;
    const ass = parseFloat(assignment) || 0;
    const pre = parseFloat(presentation) || 0;
    const mid = parseFloat(midterm) || 0;
    const fin = parseFloat(final) || 0;

    const total = quizContribution + att + ass + pre + mid + fin;
    return Math.min(total, 100);
  })();

  const calculatedSGPA = gradePoint(totalCalculatedMarks);

  async function handleSave() {
    setLoading(true);

    const parsedQuizzes = quizMarks.map(Number).filter((v) => !isNaN(v) && v >= 0);
    const payload = {
      user_id:      userId,
      course_id:    course.id,
      semester:     course.semester,
      quiz_marks:   parsedQuizzes,
      midterm_mark: midterm !== "" ? parseFloat(midterm) : null,
      final_mark:   final !== "" ? parseFloat(final) : null,
      attendance:   attendance !== "" ? parseFloat(attendance) : null,
      assignment:   assignment !== "" ? parseFloat(assignment) : null,
      presentation: presentation !== "" ? parseFloat(presentation) : null,
      sgpa:         calculatedSGPA,
    };

    let error;
    if (existingGrade) {
      ({ error } = await supabase.from("grades").update(payload).eq("id", existingGrade.id));
    } else {
      ({ error } = await supabase.from("grades").insert(payload));
    }

    if (error) {
      toast.error("Failed to save grades.");
      setLoading(false);
      return;
    }

    if (calculatedSGPA !== null) {
      await supabase
        .from("semester_gpas")
        .upsert({
          user_id:  userId,
          semester: course.semester,
          sgpa:     calculatedSGPA,
        }, { onConflict: "user_id,semester" });
    }

    const { data: allSemGpas } = await supabase.from("semester_gpas").select("sgpa").eq("user_id", userId);
    if (allSemGpas?.length) {
      const newCGPA = allSemGpas.reduce((a, s) => a + s.sgpa, 0) / allSemGpas.length;
      await supabase.from("profiles").update({ current_cgpa: Math.round(newCGPA * 100) / 100 }).eq("id", userId);
    }

    toast.success("Grades saved! CGPA updated. 🎓");
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up"
        style={{
          width: "100%", maxWidth: "600px", padding: "2rem", maxHeight: "90vh", overflowY: "auto",
          background: "var(--color-surface-100)", borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 30px -5px rgba(124,58,237,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
              {existingGrade ? "Update" : "Enter"} Grades
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              {course.name} · Semester {course.semester}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <X size={16} style={{ color: "var(--color-text-muted)" }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Continuous Assessment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <MarkField label="Attendance" value={attendance} onChange={setAttendance} hint="Out of 7" max={7} />
            <MarkField label="Assignment" value={assignment} onChange={setAssignment} hint="Out of 5" max={5} />
            <MarkField label="Presentation" value={presentation} onChange={setPresentation} hint="Out of 8" max={8} />
          </div>

          {/* Quiz Marks */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <label style={labelStyle}>Quizzes (Average out of 15)</label>
              <button
                type="button"
                onClick={() => setQuizMarks((p) => [...p, ""])}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.75rem", borderRadius: "8px",
                  background: "rgba(124, 58, 237, 0.15)", border: "1px solid rgba(124, 58, 237, 0.25)", color: "var(--color-primary-300)",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <Plus size={12} /> Add Quiz
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
              {quizMarks.map((mark, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                      Q{i + 1}
                    </span>
                    <input
                      type="number" min={0} max={15} step={0.5} value={mark}
                      onChange={(e) => {
                        const updated = [...quizMarks];
                        updated[i] = e.target.value;
                        setQuizMarks(updated);
                      }}
                      style={{
                        width: "90px", paddingLeft: "2rem", paddingRight: "0.5rem", height: "38px",
                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                        fontSize: "0.875rem", color: "var(--color-text-primary)", outline: "none",
                        transition: "all 0.2s"
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-primary-400)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.15)";
                      }}
                      onBlur={(e)  => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {quizMarks.length > 1 && (
                    <button type="button" onClick={() => setQuizMarks((p) => p.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "2px" }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exams */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <MarkField label="Midterm Test" value={midterm} onChange={setMidterm} hint="Out of 25" max={25} />
            <MarkField label="Final Examination" value={final} onChange={setFinal} hint="Out of 40" max={40} />
          </div>

          {/* Total Preview */}
          <div style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Total Marks / 100</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: gradeColor(totalCalculatedMarks), lineHeight: 1 }}>{totalCalculatedMarks.toFixed(1)}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Grade / Grade Point</p>
              <p style={{ fontSize: "2.25rem", fontWeight: 700, color: gradeColor(totalCalculatedMarks), lineHeight: 1 }}>
                {letterGrade(totalCalculatedMarks)} <span style={{ fontSize: "1.25rem", opacity: 0.8 }}>({calculatedSGPA.toFixed(2)})</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
              {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : `${existingGrade ? "Update" : "Save"} Grades 🎓`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkField({ label, value, onChange, hint, max }: { label: string; value: string; onChange: (v: string) => void; hint: string; max: number; }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="number" min={0} max={max} step={0.5} className="clay-input" placeholder={hint} value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "0.375rem" };