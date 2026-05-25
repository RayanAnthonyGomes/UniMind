// // src/components/grades/CourseGradeList.tsx
// "use client";

// import { useState } from "react";
// import { Plus } from "lucide-react";
// import { letterGrade, gradeColor } from "@/lib/utils";
// import GradeEntryModal from "./GradeEntryModal";
// import type { Course } from "@/types";

// interface Grade {
//   id:            string;
//   course_id:     string;
//   quiz_marks:    number[];
//   midterm_mark:  number | null;
//   final_mark:    number | null;
//   attendance:    number | null;
//   sgpa:          number | null;
// }

// export default function CourseGradeList({
//   courses, gradesByCourse, userId,
// }: {
//   courses:         Course[];
//   gradesByCourse:  Record<string, Grade>;
//   userId:          string;
// }) {
//   const [selected, setSelected] = useState<Course | null>(null);

//   if (courses.length === 0) {
//     return (
//       <div className="clay-card" style={{
//         padding: "3rem", textAlign: "center",
//         border: "1px dashed var(--color-surface-300)",
//         boxShadow: "none",
//       }}>
//         <p style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>📊</p>
//         <h3 style={{ fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>No courses yet</h3>
//         <p style={{ color: "#78716c", fontSize: "0.875rem" }}>
//           Add courses first, then track your grades here.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="clay-card" style={{ padding: "1.75rem" }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
//           <div>
//             <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.25rem" }}>
//               Course Grades
//             </h2>
//             <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
//               Click a course to enter or update grades
//             </p>
//           </div>
//         </div>

//         {/* Table header */}
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 80px",
//           gap: "0.5rem",
//           padding: "0.625rem 1rem",
//           background: "var(--color-surface-50)",
//           borderRadius: "10px",
//           marginBottom: "0.625rem",
//         }}>
//           {["Course", "Quizzes", "Midterm", "Final", "Attendance", "SGPA", ""].map((h) => (
//             <span key={h} style={{ fontSize: "0.75rem", fontWeight: 600, color: "#78716c" }}>{h}</span>
//           ))}
//         </div>

//         {/* Course rows */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//           {courses.map((course) => {
//             const grade   = gradesByCourse[course.id];
//             const quizAvg = grade?.quiz_marks?.length
//               ? grade.quiz_marks.reduce((a, b) => a + b, 0) / grade.quiz_marks.length
//               : null;
//             const sgpa    = grade?.sgpa;

//             return (
//               <div
//                 key={course.id}
//                 onClick={() => setSelected(course)}
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 80px",
//                   gap: "0.5rem",
//                   padding: "0.875rem 1rem",
//                   borderRadius: "10px",
//                   border: "1px solid var(--color-surface-200)",
//                   cursor: "pointer",
//                   transition: "all 0.15s",
//                   alignItems: "center",
//                   background: "white",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = "var(--color-surface-50)";
//                   e.currentTarget.style.borderColor = "var(--color-primary-200)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = "white";
//                   e.currentTarget.style.borderColor = "var(--color-surface-200)";
//                 }}
//               >
//                 {/* Course name */}
//                 <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
//                   <div style={{
//                     width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
//                     background: course.color ?? "#6366f1",
//                   }} />
//                   <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1c1917",
//                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                     {course.name}
//                   </span>
//                 </div>

//                 {/* Quiz avg */}
//                 <GradeCell value={quizAvg} />

//                 {/* Midterm */}
//                 <GradeCell value={grade?.midterm_mark ?? null} />

//                 {/* Final */}
//                 <GradeCell value={grade?.final_mark ?? null} />

//                 {/* Attendance */}
//                 <AttendanceCell value={grade?.attendance ?? null} />

//                 {/* SGPA */}
//                 {sgpa ? (
//                   <span style={{ fontSize: "0.9rem", fontWeight: 700, color: gradeColor(sgpa * 25) }}>
//                     {sgpa.toFixed(2)}
//                   </span>
//                 ) : (
//                   <span style={{ fontSize: "0.8rem", color: "#c9bfb3" }}>—</span>
//                 )}

//                 {/* Action */}
//                 <button
//                   onClick={(e) => { e.stopPropagation(); setSelected(course); }}
//                   style={{
//                     display: "flex", alignItems: "center", gap: "0.25rem",
//                     padding: "0.375rem 0.625rem", borderRadius: "8px",
//                     background: "var(--color-primary-50)",
//                     border: "1px solid var(--color-primary-100)",
//                     color: "var(--color-primary-600)",
//                     fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
//                   }}
//                 >
//                   <Plus size={12} />
//                   {grade ? "Edit" : "Add"}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Grade entry modal */}
//       {selected && (
//         <GradeEntryModal
//           course={selected}
//           existingGrade={gradesByCourse[selected.id] ?? null}
//           userId={userId}
//           onClose={() => setSelected(null)}
//         />
//       )}
//     </>
//   );
// }

// function GradeCell({ value }: { value: number | null }) {
//   if (value === null) return <span style={{ fontSize: "0.8rem", color: "#c9bfb3" }}>—</span>;
//   const letter = letterGrade(value);
//   const color  = gradeColor(value);
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
//       <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1c1917" }}>
//         {value.toFixed(1)}
//       </span>
//       <span style={{
//         fontSize: "0.7rem", fontWeight: 700, padding: "1px 5px",
//         borderRadius: "4px", background: `${color}18`, color,
//       }}>
//         {letter}
//       </span>
//     </div>
//   );
// }

// function AttendanceCell({ value }: { value: number | null }) {
//   if (value === null) return <span style={{ fontSize: "0.8rem", color: "#c9bfb3" }}>—</span>;
//   const color = value >= 75 ? "#22c55e" : value >= 60 ? "#f59e0b" : "#ef4444";
//   return (
//     <div>
//       <span style={{ fontSize: "0.875rem", fontWeight: 600, color }}>{value}%</span>
//     </div>
//   );
// }

//gemini change korse ami kicchu kori nai 
// src/components/grades/CourseGradeList.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { gradeColor } from "@/lib/utils";
import GradeEntryModal from "./GradeEntryModal";
import type { Course } from "@/types";

interface Grade {
  id:            string;
  course_id:     string;
  quiz_marks:    number[];
  midterm_mark:  number | null;
  final_mark:    number | null;
  attendance:    number | null;
  sgpa:          number | null;
}

export default function CourseGradeList({
  courses, gradesByCourse, userId,
}: {
  courses:         Course[];
  gradesByCourse:  Record<string, Grade>;
  userId:          string;
}) {
  const [selected, setSelected] = useState<Course | null>(null);

  if (courses.length === 0) {
    return (
      <div className="clay-card" style={{
        padding: "3rem", textAlign: "center",
        border: "1px dashed var(--color-surface-300)",
        boxShadow: "none",
      }}>
        <p style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>📊</p>
        <h3 style={{ fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>No courses yet</h3>
        <p style={{ color: "#78716c", fontSize: "0.875rem" }}>
          Add courses first, then track your grades here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="clay-card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.25rem" }}>
              Course Grades
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
              Click a course to enter or update grades
            </p>
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 80px",
          gap: "0.5rem",
          padding: "0.625rem 1rem",
          background: "var(--color-surface-50)",
          borderRadius: "10px",
          marginBottom: "0.625rem",
        }}>
          {["Course", "Quizzes", "Midterm", "Final", "Attendance", "SGPA", ""].map((h) => (
            <span key={h} style={{ fontSize: "0.75rem", fontWeight: 600, color: "#78716c" }}>{h}</span>
          ))}
        </div>

        {/* Course rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {courses.map((course) => {
            const grade   = gradesByCourse[course.id];
            
            // Calculate Quiz Average
            const validQuizzes = grade?.quiz_marks?.map(Number).filter(v => !isNaN(v) && v >= 0) || [];
            const quizAvg = validQuizzes.length > 0 
              ? validQuizzes.reduce((a, b) => a + b, 0) / validQuizzes.length 
              : null;
              
            const sgpa    = grade?.sgpa;

            return (
              <div
                key={course.id}
                onClick={() => setSelected(course)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 80px",
                  gap: "0.5rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid var(--color-surface-200)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  alignItems: "center",
                  background: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-50)";
                  e.currentTarget.style.borderColor = "var(--color-primary-200)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "var(--color-surface-200)";
                }}
              >
                {/* Course name */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                    background: course.color ?? "#6366f1",
                  }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1c1917",
                                 overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {course.name}
                  </span>
                </div>

                {/* Quiz avg */}
                <ScoreCell value={quizAvg} max={15} />

                {/* Midterm */}
                <ScoreCell value={grade?.midterm_mark ?? null} max={25} />

                {/* Final */}
                <ScoreCell value={grade?.final_mark ?? null} max={40} />

                {/* Attendance */}
                <ScoreCell value={grade?.attendance ?? null} max={7} />

                {/* SGPA */}
                {sgpa !== null && sgpa !== undefined ? (
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: gradeColor(sgpa * 25) }}>
                    {sgpa.toFixed(2)}
                  </span>
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#c9bfb3" }}>—</span>
                )}

                {/* Action */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(course); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem",
                    padding: "0.375rem 0.625rem", borderRadius: "8px",
                    background: "var(--color-primary-50)",
                    border: "1px solid var(--color-primary-100)",
                    color: "var(--color-primary-600)",
                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <Plus size={12} />
                  {grade ? "Edit" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade entry modal */}
      {selected && (
        <GradeEntryModal
          course={selected}
          existingGrade={gradesByCourse[selected.id] ?? null}
          userId={userId}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function ScoreCell({ value, max }: { value: number | null; max: number }) {
  if (value === null || value === undefined) {
    return <span style={{ fontSize: "0.8rem", color: "#c9bfb3" }}>—</span>;
  }
  
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1c1917" }}>
        {value.toFixed(1)}
      </span>
      <span style={{ fontSize: "0.7rem", color: "#a8a29e", fontWeight: 500 }}>
        / {max}
      </span>
    </div>
  );
}