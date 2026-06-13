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
      <div className="glass-card-static" style={{
        padding: "3rem", textAlign: "center",
        border: "1px dashed rgba(255, 255, 255, 0.1)",
        boxShadow: "none",
      }}>
        <p style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>📊</p>
        <h3 style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>No courses yet</h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Add courses first, then track your grades here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card-static" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem", fontFamily: "var(--font-display)" }}>
              Course Grades
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
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
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "10px",
          marginBottom: "0.625rem",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          {["Course", "Quizzes", "Midterm", "Final", "Attendance", "SGPA", ""].map((h) => (
            <span key={h} style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>{h}</span>
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
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.02)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                }}
              >
                {/* Course name */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                    background: course.color ?? "#818cf8",
                    boxShadow: `0 0 8px ${course.color ?? "#818cf8"}80`
                  }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)",
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
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>—</span>
                )}

                {/* Action */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(course); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem",
                    padding: "0.375rem 0.625rem", borderRadius: "8px",
                    background: "rgba(124, 58, 237, 0.12)",
                    border: "1px solid rgba(124, 58, 237, 0.2)",
                    color: "var(--color-primary-300)",
                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124, 58, 237, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(124, 58, 237, 0.12)";
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
    return <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>—</span>;
  }
  
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
        {value.toFixed(1)}
      </span>
      <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
        / {max}
      </span>
    </div>
  );
}