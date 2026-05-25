// // src/components/grades/GradeEntryModal.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";
// import toast from "react-hot-toast";
// import { X, Plus, Trash2, Loader2 } from "lucide-react";
// import { gradePoint, letterGrade, gradeColor, weightedSGPA } from "@/lib/utils";
// import type { Course } from "@/types";

// interface Grade {
//   id:           string;
//   course_id:    string;
//   quiz_marks:   number[];
//   midterm_mark: number | null;
//   final_mark:   number | null;
//   attendance:   number | null;
//   sgpa:         number | null;
// }

// interface Props {
//   course:        Course;
//   existingGrade: Grade | null;
//   userId:        string;
//   onClose:       () => void;
// }

// export default function GradeEntryModal({ course, existingGrade, userId, onClose }: Props) {
//   const router   = useRouter();
//   const supabase = createClient();

//   const [quizMarks,  setQuizMarks]  = useState<string[]>(
//     existingGrade?.quiz_marks?.map(String) ?? [""]
//   );
//   const [midterm,    setMidterm]    = useState<string>(existingGrade?.midterm_mark?.toString() ?? "");
//   const [final,      setFinal]      = useState<string>(existingGrade?.final_mark?.toString()   ?? "");
//   const [attendance, setAttendance] = useState<string>(existingGrade?.attendance?.toString()   ?? "");
//   const [loading,    setLoading]    = useState(false);

//   // Live calculated SGPA
//   const calculatedSGPA = (() => {
//     const quizAvg = quizMarks.length
//       ? quizMarks.map(Number).filter((v) => !isNaN(v) && v >= 0).reduce((a, b, _, arr) => a + b / arr.length, 0)
//       : 0;
//     const mid = parseFloat(midterm) || 0;
//     const fin = parseFloat(final)   || 0;

//     // Typical weighting: quizzes 20%, midterm 30%, final 50%
//     const hasQuiz = quizMarks.some((q) => q !== "");
//     const hasMid  = midterm !== "";
//     const hasFin  = final   !== "";

//     if (!hasQuiz && !hasMid && !hasFin) return null;

//     let total  = 0;
//     let weight = 0;

//     if (hasQuiz) { total += gradePoint(quizAvg) * 0.20; weight += 0.20; }
//     if (hasMid)  { total += gradePoint(mid)     * 0.30; weight += 0.30; }
//     if (hasFin)  { total += gradePoint(fin)      * 0.50; weight += 0.50; }

//     const raw = weight > 0 ? total / weight : 0;
//     return Math.round(raw * 100) / 100;
//   })();

//   async function handleSave() {
//     setLoading(true);

//     const parsedQuizzes    = quizMarks.map(Number).filter((v) => !isNaN(v) && v >= 0);
//     const parsedMidterm    = midterm    !== "" ? parseFloat(midterm)    : null;
//     const parsedFinal      = final      !== "" ? parseFloat(final)      : null;
//     const parsedAttendance = attendance !== "" ? parseFloat(attendance) : null;

//     const payload = {
//       user_id:      userId,
//       course_id:    course.id,
//       semester:     course.semester,
//       quiz_marks:   parsedQuizzes,
//       midterm_mark: parsedMidterm,
//       final_mark:   parsedFinal,
//       attendance:   parsedAttendance,
//       sgpa:         calculatedSGPA,
//     };

//     let error;

//     if (existingGrade) {
//       ({ error } = await supabase
//         .from("grades")
//         .update(payload)
//         .eq("id", existingGrade.id));
//     } else {
//       ({ error } = await supabase.from("grades").insert(payload));
//     }

//     if (error) {
//       toast.error("Failed to save grades.");
//       setLoading(false);
//       return;
//     }

//     // Update semester_gpas table
//     if (calculatedSGPA !== null) {
//       await supabase
//         .from("semester_gpas")
//         .upsert({
//           user_id:  userId,
//           semester: course.semester,
//           sgpa:     calculatedSGPA,
//         }, { onConflict: "user_id,semester" });
//     }

//     // Recalculate and update CGPA on profile
//     const { data: allSemGpas } = await supabase
//       .from("semester_gpas")
//       .select("sgpa")
//       .eq("user_id", userId);

//     if (allSemGpas?.length) {
//       const newCGPA = allSemGpas.reduce((a, s) => a + s.sgpa, 0) / allSemGpas.length;
//       await supabase
//         .from("profiles")
//         .update({ current_cgpa: Math.round(newCGPA * 100) / 100 })
//         .eq("id", userId);
//     }

//     toast.success("Grades saved! CGPA updated. 🎓");
//     setLoading(false);
//     onClose();
//     router.refresh();
//   }

//   const quizAvg = quizMarks.length
//     ? quizMarks.map(Number).filter((v) => !isNaN(v) && v >= 0)
//         .reduce((a, b, _, arr) => a + b / arr.length, 0)
//     : null;

//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed", inset: 0, zIndex: 50,
//         background: "rgba(0,0,0,0.4)",
//         display: "flex", alignItems: "center", justifyContent: "center",
//         padding: "1rem", backdropFilter: "blur(4px)",
//       }}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className="clay-card animate-slide-up"
//         style={{ width: "100%", maxWidth: "540px", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}
//       >
//         {/* Header */}
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
//           <div>
//             <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1c1917" }}>
//               {existingGrade ? "Update" : "Enter"} Grades
//             </h2>
//             <p style={{ fontSize: "0.8rem", color: "#78716c", marginTop: "0.25rem" }}>
//               {course.name} · Semester {course.semester}
//             </p>
//           </div>
//           <button onClick={onClose}
//             style={{ background: "var(--color-surface-100)", border: "1px solid var(--color-surface-200)",
//                      borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
//             <X size={16} style={{ color: "#78716c" }} />
//           </button>
//         </div>

//         <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

//           {/* Quiz Marks */}
//           <div>
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
//               <label style={labelStyle}>
//                 Quiz Marks
//                 {quizAvg !== null && quizMarks.some((q) => q !== "") && (
//                   <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: gradeColor(quizAvg),
//                                  fontWeight: 600 }}>
//                     Avg: {quizAvg.toFixed(1)} ({letterGrade(quizAvg)})
//                   </span>
//                 )}
//               </label>
//               <button
//                 type="button"
//                 onClick={() => setQuizMarks((p) => [...p, ""])}
//                 style={{
//                   display: "flex", alignItems: "center", gap: "0.25rem",
//                   padding: "0.3rem 0.75rem", borderRadius: "8px",
//                   background: "var(--color-primary-50)",
//                   border: "1px solid var(--color-primary-100)",
//                   color: "var(--color-primary-600)",
//                   fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
//                 }}
//               >
//                 <Plus size={12} /> Add Quiz
//               </button>
//             </div>

//             <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
//               {quizMarks.map((mark, i) => (
//                 <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
//                   <div style={{ position: "relative" }}>
//                     <span style={{
//                       position: "absolute", left: "0.625rem", top: "50%",
//                       transform: "translateY(-50%)",
//                       fontSize: "0.7rem", color: "#a8a29e", fontWeight: 600,
//                     }}>
//                       Q{i + 1}
//                     </span>
//                     <input
//                       type="number" min={0} max={100} step={0.5}
//                       value={mark}
//                       onChange={(e) => {
//                         const updated = [...quizMarks];
//                         updated[i] = e.target.value;
//                         setQuizMarks(updated);
//                       }}
//                       style={{
//                         width: "90px", paddingLeft: "2rem", paddingRight: "0.5rem",
//                         height: "38px",
//                         border: "1px solid var(--color-surface-300)",
//                         borderRadius: "8px", background: "var(--color-surface-50)",
//                         fontSize: "0.875rem", color: "#1c1917", outline: "none",
//                         borderColor: mark !== "" ? gradeColor(parseFloat(mark)) + "60" : undefined,
//                       }}
//                       onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.15)"}
//                       onBlur={(e)  => e.currentTarget.style.boxShadow = "none"}
//                     />
//                   </div>
//                   {quizMarks.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => setQuizMarks((p) => p.filter((_, idx) => idx !== i))}
//                       style={{ background: "none", border: "none", cursor: "pointer",
//                                color: "#c9bfb3", padding: "2px" }}
//                     >
//                       <Trash2 size={13} />
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Midterm + Final + Attendance */}
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
//             <MarkField
//               label="Midterm"
//               value={midterm}
//               onChange={setMidterm}
//               hint="Out of 100"
//             />
//             <MarkField
//               label="Final Exam"
//               value={final}
//               onChange={setFinal}
//               hint="Out of 100"
//             />
//             <div>
//               <label style={labelStyle}>Attendance %</label>
//               <input
//                 type="number" min={0} max={100} step={1}
//                 className="clay-input"
//                 placeholder="e.g. 85"
//                 value={attendance}
//                 onChange={(e) => setAttendance(e.target.value)}
//               />
//               {attendance !== "" && (
//                 <p style={{
//                   fontSize: "0.75rem", marginTop: "0.25rem",
//                   color: parseFloat(attendance) >= 75 ? "#22c55e" :
//                          parseFloat(attendance) >= 60 ? "#f59e0b" : "#ef4444",
//                   fontWeight: 600,
//                 }}>
//                   {parseFloat(attendance) >= 75 ? "✓ Good" :
//                    parseFloat(attendance) >= 60 ? "⚠ Low" : "✗ Critical"}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Weighting info */}
//           <div style={{
//             padding: "0.875rem", borderRadius: "10px",
//             background: "var(--color-surface-50)",
//             border: "1px solid var(--color-surface-200)",
//             display: "flex", gap: "1rem", flexWrap: "wrap",
//           }}>
//             {[
//               { label: "Quizzes", weight: "20%" },
//               { label: "Midterm", weight: "30%" },
//               { label: "Final",   weight: "50%" },
//             ].map((w) => (
//               <div key={w.label} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
//                 <span style={{ fontSize: "0.75rem", color: "#78716c" }}>{w.label}:</span>
//                 <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#44403c" }}>{w.weight}</span>
//               </div>
//             ))}
//             <span style={{ fontSize: "0.7rem", color: "#a8a29e" }}>· Standard university weighting</span>
//           </div>

//           {/* Live SGPA preview */}
//           {calculatedSGPA !== null && (
//             <div style={{
//               padding: "1.25rem", borderRadius: "12px",
//               background: "linear-gradient(135deg, var(--color-primary-50), #f0fdf4)",
//               border: "1px solid var(--color-primary-100)",
//               display: "flex", alignItems: "center", justifyContent: "space-between",
//             }}>
//               <div>
//                 <p style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "0.25rem" }}>
//                   Calculated SGPA for {course.name}
//                 </p>
//                 <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
//                   This will update your CGPA automatically
//                 </p>
//               </div>
//               <div style={{ textAlign: "right" }}>
//                 <p style={{
//                   fontSize: "2.25rem", fontWeight: 700,
//                   color: gradeColor(calculatedSGPA * 25),
//                   lineHeight: 1,
//                 }}>
//                   {calculatedSGPA.toFixed(2)}
//                 </p>
//                 <p style={{ fontSize: "0.75rem", color: "#78716c" }}>out of 4.00</p>
//               </div>
//             </div>
//           )}

//           {/* Actions */}
//           <div style={{ display: "flex", gap: "0.75rem" }}>
//             <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
//               Cancel
//             </button>
//             <button
//               type="button"
//               className="btn-primary"
//               style={{ flex: 1 }}
//               onClick={handleSave}
//               disabled={loading}
//             >
//               {loading
//                 ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
//                 : `${existingGrade ? "Update" : "Save"} Grades 🎓`
//               }
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function MarkField({
//   label, value, onChange, hint,
// }: {
//   label:    string;
//   value:    string;
//   onChange: (v: string) => void;
//   hint:     string;
// }) {
//   const num    = parseFloat(value);
//   const hasVal = value !== "" && !isNaN(num);

//   return (
//     <div>
//       <label style={labelStyle}>{label}</label>
//       <input
//         type="number" min={0} max={100} step={0.5}
//         className="clay-input"
//         placeholder="0 – 100"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       />
//       {hasVal ? (
//         <p style={{
//           fontSize: "0.75rem", marginTop: "0.25rem",
//           color: gradeColor(num), fontWeight: 600,
//         }}>
//           {letterGrade(num)} · {gradePoint(num).toFixed(2)} GP
//         </p>
//       ) : (
//         <p style={{ fontSize: "0.7rem", color: "#a8a29e", marginTop: "0.25rem" }}>{hint}</p>
//       )}
//     </div>
//   );
// }

// const labelStyle: React.CSSProperties = {
//   display: "block", fontSize: "0.875rem",
//   fontWeight: 500, color: "#44403c", marginBottom: "0.375rem",
// };
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

  // Daffodil International University Calculation
  const totalCalculatedMarks = (() => {
    // 3 Quizzes averaged to 15 marks. 
    const validQuizzes = quizMarks.map(Number).filter((v) => !isNaN(v) && v >= 0);
    let quizContribution = 0;
    if (validQuizzes.length > 0) {
      const quizSum = validQuizzes.reduce((a, b) => a + b, 0);
      // Assuming each quiz is out of 15, we take the average. If they are out of something else, this logic needs tweaking.
      quizContribution = quizSum / validQuizzes.length;
    }

    const att = parseFloat(attendance) || 0; // Out of 7
    const ass = parseFloat(assignment) || 0; // Out of 5
    const pre = parseFloat(presentation) || 0; // Out of 8
    const mid = parseFloat(midterm) || 0;    // Out of 25
    const fin = parseFloat(final) || 0;      // Out of 40

    const total = quizContribution + att + ass + pre + mid + fin;
    return Math.min(total, 100); // Cap at 100 just in case
  })();

  const calculatedSGPA = gradePoint(totalCalculatedMarks);

  async function handleSave() {
    setLoading(true);

    const parsedQuizzes    = quizMarks.map(Number).filter((v) => !isNaN(v) && v >= 0);
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

    // Update semester_gpas table
    if (calculatedSGPA !== null) {
      await supabase
        .from("semester_gpas")
        .upsert({
          user_id:  userId,
          semester: course.semester,
          sgpa:     calculatedSGPA, // Note: Accurate semester SGPA requires credit weighting across all courses, this is a simplified store for now based on previous code.
        }, { onConflict: "user_id,semester" });
    }

    // Recalculate and update CGPA on profile (Simplified average of SGPAs)
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
        background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="clay-card animate-slide-up"
        style={{ width: "100%", maxWidth: "600px", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1c1917" }}>
              {existingGrade ? "Update" : "Enter"} Grades
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#78716c", marginTop: "0.25rem" }}>
              {course.name} · Semester {course.semester}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "var(--color-surface-100)", border: "1px solid var(--color-surface-200)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <X size={16} style={{ color: "#78716c" }} />
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
                  background: "var(--color-primary-50)", border: "1px solid var(--color-primary-100)", color: "var(--color-primary-600)",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                }}
              >
                <Plus size={12} /> Add Quiz
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
              {quizMarks.map((mark, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: "#a8a29e", fontWeight: 600 }}>
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
                        border: "1px solid var(--color-surface-300)", borderRadius: "8px", background: "var(--color-surface-50)",
                        fontSize: "0.875rem", color: "#1c1917", outline: "none",
                      }}
                      onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.15)"}
                      onBlur={(e)  => e.currentTarget.style.boxShadow = "none"}
                    />
                  </div>
                  {quizMarks.length > 1 && (
                    <button type="button" onClick={() => setQuizMarks((p) => p.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#c9bfb3", padding: "2px" }}>
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
          <div style={{ padding: "1.25rem", borderRadius: "12px", background: "linear-gradient(135deg, var(--color-primary-50), #f0fdf4)", border: "1px solid var(--color-primary-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "0.25rem" }}>Total Marks / 100</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: gradeColor(totalCalculatedMarks), lineHeight: 1 }}>{totalCalculatedMarks.toFixed(1)}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "0.25rem" }}>Grade / Grade Point</p>
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

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#44403c", marginBottom: "0.375rem" };