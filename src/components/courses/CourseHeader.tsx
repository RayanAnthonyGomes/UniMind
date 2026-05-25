// src/components/courses/CourseHeader.tsx
"use client";

import Link from "next/link";
import { ChevronLeft, BookOpen, FileText, Edit2 } from "lucide-react";
import type { Course } from "@/types";

export default function CourseHeader({
  course, documentCount,
}: {
  course:        Course;
  documentCount: number;
}) {
  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/courses"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem",
                 fontSize: "0.875rem", color: "#78716c", textDecoration: "none",
                 marginBottom: "1rem" }}>
        <ChevronLeft size={14} /> Back to Courses
      </Link>

      {/* Header card */}
      <div className="clay-card" style={{
        padding: "1.75rem",
        borderTop: `4px solid ${course.color ?? "#6366f1"}`,
        display: "flex", alignItems: "center", gap: "1.25rem",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "14px", flexShrink: 0,
          background: `${course.color ?? "#6366f1"}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BookOpen size={26} style={{ color: course.color ?? "#6366f1" }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1c1917" }}>
              {course.name}
            </h1>
            {course.course_code && (
              <span className="clay-badge" style={{
                background: `${course.color ?? "#6366f1"}15`,
                color: course.color ?? "#6366f1",
              }}>
                {course.course_code}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {[
              { label: course.category },
              { label: `${course.credits} credits` },
              { label: `Semester ${course.semester}` },
              { label: `${documentCount} file${documentCount !== 1 ? "s" : ""}` },
            ].map((item) => (
              <span key={item.label} style={{ fontSize: "0.8375rem", color: "#78716c" }}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}