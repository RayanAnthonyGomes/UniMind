// src/components/lectures/LectureReader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, Clock, BookOpen, CheckCircle2,
  Target, Star, Hash, ChevronDown, ChevronUp,
} from "lucide-react";

interface Section {
  heading:   string;
  content:   string;
  key_point: string;
}

interface KeyTerm {
  term:       string;
  definition: string;
}

interface Lecture {
  id:         string;
  title:      string;
  topic:      string;
  objectives: string[];
  sections:   Section[];
  key_terms:  KeyTerm[];
  summary:    string[];
  read_time:  number;
  is_read:    boolean;
  created_at: string;
}

interface Course {
  name:  string;
  color: string;
}

export default function LectureReader({
  lecture, course, courseId,
}: {
  lecture:  Lecture;
  course:   Course;
  courseId: string;
}) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [showAllTerms,    setShowAllTerms]    = useState(false);

  const sections  = Array.isArray(lecture.sections)  ? lecture.sections  : [];
  const keyTerms  = Array.isArray(lecture.key_terms)  ? lecture.key_terms  : [];
  const objectives = Array.isArray(lecture.objectives) ? lecture.objectives : [];
  const summary   = Array.isArray(lecture.summary)   ? lecture.summary   : [];

  const visibleTerms = showAllTerms ? keyTerms : keyTerms.slice(0, 6);

  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>

      {/* Back */}
      <Link
        href={`/courses/${courseId}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.375rem",
          fontSize: "0.875rem", color: "#78716c", textDecoration: "none",
          marginBottom: "1.5rem",
        }}
      >
        <ChevronLeft size={14} /> Back to {course.name}
      </Link>

      {/* Hero header */}
      <div
        className="clay-card"
        style={{
          padding: "2.5rem",
          marginBottom: "1.75rem",
          borderTop: `5px solid ${course.color ?? "#6366f1"}`,
          background: "linear-gradient(135deg, white 0%, var(--color-surface-50) 100%)",
        }}
      >
        {/* Course + meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <span
            className="clay-badge"
            style={{
              background: `${course.color ?? "#6366f1"}15`,
              color:      course.color ?? "#6366f1",
              fontSize:   "0.8rem", fontWeight: 700,
            }}
          >
            📚 {course.name}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem",
                         fontSize: "0.8rem", color: "#78716c" }}>
            <Clock size={13} /> {lecture.read_time} min read
          </span>
          <span className="clay-badge" style={{
            background: "#f0fdf4", color: "#22c55e", fontSize: "0.75rem",
          }}>
            <CheckCircle2 size={11} /> Read
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 800, color: "#1c1917",
          lineHeight: 1.2, marginBottom: "0.75rem",
          letterSpacing: "-0.03em",
        }}>
          {lecture.title}
        </h1>

        {lecture.topic && (
          <p style={{ fontSize: "1rem", color: "#78716c", fontStyle: "italic" }}>
            Topic: {lecture.topic}
          </p>
        )}

        {/* Progress bar (decorative) */}
        <div style={{
          marginTop: "1.5rem",
          height: "4px",
          background: "var(--color-surface-200)",
          borderRadius: "999px",
          overflow: "hidden",
        }}>
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(90deg, ${course.color ?? "#6366f1"}, #22c55e)`,
            borderRadius: "999px",
          }} />
        </div>
        <p style={{ fontSize: "0.75rem", color: "#a8a29e", marginTop: "0.375rem" }}>
          ✅ Lecture complete
        </p>
      </div>

      {/* Learning objectives */}
      {objectives.length > 0 && (
        <div className="clay-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "var(--color-primary-50)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Target size={16} style={{ color: "var(--color-primary-600)" }} />
            </div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917" }}>
              What You'll Learn
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {objectives.map((obj, i) => (
              <div key={i} style={{
                display: "flex", gap: "0.75rem", alignItems: "flex-start",
                padding: "0.625rem 0.875rem",
                background: "var(--color-surface-50)",
                borderRadius: "8px",
                border: "1px solid var(--color-surface-100)",
              }}>
                <span style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "var(--color-primary-100)",
                  color: "var(--color-primary-700)",
                  fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: "0.9rem", color: "#44403c", lineHeight: 1.6 }}>
                  {obj}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {sections.map((section, i) => (
          <div key={i} className="clay-card" style={{ overflow: "hidden" }}>

            {/* Section header */}
            <button
              onClick={() => setExpandedSection(expandedSection === i ? null : i)}
              style={{
                width: "100%", padding: "1.25rem 1.75rem",
                display: "flex", alignItems: "center", gap: "1rem",
                background: "none", border: "none", cursor: "pointer",
                textAlign: "left",
                borderBottom: expandedSection === i ? "1px solid var(--color-surface-200)" : "none",
              }}
            >
              {/* Section number */}
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                background: `${course.color ?? "#6366f1"}15`,
                color: course.color ?? "#6366f1",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "0.9rem",
              }}>
                {i + 1}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#1c1917", marginBottom: "0.125rem" }}>
                  {section.heading}
                </p>
                {expandedSection !== i && (
                  <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
                    Click to read this section
                  </p>
                )}
              </div>

              {expandedSection === i
                ? <ChevronUp   size={18} style={{ color: "#a8a29e", flexShrink: 0 }} />
                : <ChevronDown size={18} style={{ color: "#a8a29e", flexShrink: 0 }} />
              }
            </button>

            {/* Section content */}
            {expandedSection === i && (
              <div style={{ padding: "1.5rem 1.75rem" }}>
                {/* Content */}
                <div style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.85,
                  color: "#1c1917",
                  marginBottom: "1.25rem",
                  whiteSpace: "pre-wrap",
                }}>
                  {section.content}
                </div>

                {/* Key point callout */}
                {section.key_point && (
                  <div style={{
                    padding: "1rem 1.25rem",
                    background: `${course.color ?? "#6366f1"}10`,
                    border: `1px solid ${course.color ?? "#6366f1"}30`,
                    borderLeft: `4px solid ${course.color ?? "#6366f1"}`,
                    borderRadius: "0 10px 10px 0",
                    display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  }}>
                    <Star size={16} style={{ color: course.color ?? "#6366f1", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700,
                                  color: course.color ?? "#6366f1", marginBottom: "0.25rem" }}>
                        KEY POINT
                      </p>
                      <p style={{ fontSize: "0.9rem", color: "#1c1917", lineHeight: 1.6 }}>
                        {section.key_point}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expand all hint */}
      {expandedSection === null && sections.length > 0 && (
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#a8a29e", marginBottom: "1.5rem" }}>
          Click any section above to read it
        </p>
      )}

      {/* Key terms glossary */}
      {keyTerms.length > 0 && (
        <div className="clay-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "#fffbeb",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Hash size={16} style={{ color: "#f59e0b" }} />
            </div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917" }}>
              Key Terms Glossary
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "0.75rem",
          }}>
            {visibleTerms.map((term, i) => (
              <div key={i} style={{
                padding: "0.875rem 1rem",
                background: "var(--color-surface-50)",
                borderRadius: "10px",
                border: "1px solid var(--color-surface-200)",
              }}>
                <p style={{ fontWeight: 700, fontSize: "0.875rem",
                            color: "#1c1917", marginBottom: "0.375rem" }}>
                  {term.term}
                </p>
                <p style={{ fontSize: "0.8375rem", color: "#57534e", lineHeight: 1.55 }}>
                  {term.definition}
                </p>
              </div>
            ))}
          </div>

          {keyTerms.length > 6 && (
            <button
              onClick={() => setShowAllTerms(!showAllTerms)}
              style={{
                marginTop: "1rem", width: "100%",
                padding: "0.625rem",
                background: "var(--color-surface-100)",
                border: "1px solid var(--color-surface-200)",
                borderRadius: "8px", cursor: "pointer",
                fontSize: "0.8375rem", color: "#78716c", fontWeight: 500,
              }}
            >
              {showAllTerms ? "Show less" : `Show all ${keyTerms.length} terms`}
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {summary.length > 0 && (
        <div className="clay-card" style={{
          padding: "1.75rem", marginBottom: "2rem",
          background: "linear-gradient(135deg, var(--color-primary-50), #f0fdf4)",
          border: "1px solid var(--color-primary-100)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-clay-sm)",
            }}>
              <BookOpen size={16} style={{ color: "var(--color-primary-600)" }} />
            </div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917" }}>
              Lecture Summary
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {summary.map((point, i) => (
              <div key={i} style={{
                display: "flex", gap: "0.75rem", alignItems: "flex-start",
                padding: "0.75rem 1rem",
                background: "white",
                borderRadius: "10px",
                boxShadow: "var(--shadow-clay-sm)",
              }}>
                <CheckCircle2 size={16} style={{
                  color: "var(--color-primary-500)", flexShrink: 0, marginTop: "2px",
                }} />
                <p style={{ fontSize: "0.9rem", color: "#1c1917", lineHeight: 1.6 }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "1rem 0 3rem" }}>
        <p style={{ fontSize: "0.875rem", color: "#a8a29e", marginBottom: "1rem" }}>
          Generated by UNIMIND AI from your course materials
        </p>
        <Link href={`/courses/${courseId}`} className="btn-secondary">
          <ChevronLeft size={14} /> Back to Course
        </Link>
      </div>
    </div>
  );
}