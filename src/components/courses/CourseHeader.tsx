// src/components/courses/CourseHeader.tsx
"use client";

import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import type { Course } from "@/types";
import DeleteCourseButton from "@/components/courses/DeleteCourseButton";

export default function CourseHeader({
  course, documentCount,
}: {
  course:        Course;
  documentCount: number;
}) {
  const clr = course.color ?? "#818cf8";

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/courses"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem",
                 fontSize: "0.875rem", color: "var(--color-text-muted)", textDecoration: "none",
                 marginBottom: "1rem", transition: "color 0.2s" }}>
        <ChevronLeft size={14} /> Back to Courses
      </Link>

      {/* Header card */}
      <div className="glass-card-static" style={{
        padding: "1.75rem",
        borderTop: `3px solid ${clr}`,
        display: "flex", alignItems: "center", gap: "1.25rem",
        boxShadow: `0 0 30px -8px ${clr}25`,
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "14px", flexShrink: 0,
          background: `${clr}12`,
          border: `1px solid ${clr}20`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 20px -5px ${clr}30`,
        }}>
          <BookOpen size={26} style={{ color: clr }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
            <h1 style={{
              fontSize: "1.5rem", fontWeight: 700,
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-display)",
            }}>
              {course.name}
            </h1>
            {course.course_code && (
              <span style={{
                padding: "0.2rem 0.6rem", borderRadius: "999px",
                background: `${clr}12`,
                color: clr,
                fontSize: "0.75rem", fontWeight: 600,
                border: `1px solid ${clr}20`,
              }}>
                {course.course_code}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              {[
                { label: course.category },
                { label: `${course.credits} credits` },
                { label: `Semester ${course.semester}` },
                { label: `${documentCount} file${documentCount !== 1 ? "s" : ""}` },
              ].map((item) => (
                <span key={item.label} style={{ fontSize: "0.8375rem", color: "var(--color-text-muted)" }}>
                  {item.label}
                </span>
              ))}
            </div>
            <DeleteCourseButton courseId={course.id} courseName={course.name} redirectTo="/courses" />
          </div>
        </div>
      </div>
    </div>
  );
}