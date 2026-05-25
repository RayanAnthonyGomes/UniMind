// src/components/courses/CourseCard.tsx
"use client";

import Link from "next/link";
import { BookOpen, FileText, ChevronRight } from "lucide-react";
import type { Course } from "@/types";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        className="clay-card"
        style={{ padding: "1.5rem", cursor: "pointer", position: "relative", overflow: "hidden" }}
      >
        {/* Color accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "4px",
          background: course.color ?? "#6366f1",
          borderRadius: "16px 16px 0 0",
        }} />

        {/* Icon + name */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", marginTop: "0.5rem" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
            background: `${course.color ?? "#6366f1"}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={20} style={{ color: course.color ?? "#6366f1" }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: "0.9375rem", fontWeight: 700, color: "#1c1917",
              marginBottom: "0.25rem",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {course.name}
            </h3>
            {course.course_code && (
              <p style={{ fontSize: "0.75rem", color: "#a8a29e", marginBottom: "0.25rem" }}>
                {course.course_code}
              </p>
            )}
            <p style={{ fontSize: "0.8rem", color: "#78716c" }}>
              {course.category}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "1.25rem", paddingTop: "1rem",
          borderTop: "1px solid var(--color-surface-100)",
        }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#78716c", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <FileText size={12} />
              {course.credits} credits
            </span>
          </div>
          <ChevronRight size={16} style={{ color: "#c9bfb3" }} />
        </div>
      </div>
    </Link>
  );
}