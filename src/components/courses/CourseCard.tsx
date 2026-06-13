// src/components/courses/CourseCard.tsx
"use client";

import Link from "next/link";
import { BookOpen, FileText, ChevronRight } from "lucide-react";
import type { Course } from "@/types";
import DeleteCourseButton from "@/components/courses/DeleteCourseButton";

export default function CourseCard({ course }: { course: Course }) {
  const clr = course.color ?? "#818cf8";

  return (
    <Link href={`/courses/${course.id}`} style={{ textDecoration: "none" }}>
      <div
        className="glass-card"
        style={{ padding: "1.5rem", cursor: "pointer", position: "relative", overflow: "hidden" }}
      >
        {/* Color accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${clr}, ${clr}88)`,
          boxShadow: `0 0 12px ${clr}40`,
        }} />

        {/* Icon + name */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", marginTop: "0.5rem" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
            background: `${clr}12`,
            border: `1px solid ${clr}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 15px -3px ${clr}25`,
          }}>
            <BookOpen size={20} style={{ color: clr }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text-primary)",
              marginBottom: "0.25rem", fontFamily: "var(--font-display)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {course.name}
            </h3>
            {course.course_code && (
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                {course.course_code}
              </p>
            )}
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
              {course.category}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "1.25rem", paddingTop: "1rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.04)",
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <FileText size={12} />
            {course.credits} credits
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DeleteCourseButton courseId={course.id} courseName={course.name} compact />
            <ChevronRight size={16} style={{ color: "var(--color-text-muted)" }} />
          </div>
        </div>
      </div>
    </Link>
  );
}