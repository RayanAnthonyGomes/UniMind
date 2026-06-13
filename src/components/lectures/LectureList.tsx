// src/components/lectures/LectureList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, Clock, ChevronRight,
  Sparkles, Loader2, Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Lecture {
  id:        string;
  title:     string;
  topic:     string;
  read_time: number;
  is_read:   boolean;
  summary:   string[];
  created_at: string;
}

interface Course {
  id:    string;
  name:  string;
  color: string;
}

export default function LectureList({
  lectures, course, userId,
}: {
  lectures: Lecture[];
  course:   Course;
  userId:   string;
}) {
  const router  = useRouter();
  const [topic,      setTopic]      = useState("");
  const [generating, setGenerating] = useState(false);
  const [showInput,  setShowInput]  = useState(false);

  async function generateLecture() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-lecture", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ courseId: course.id, topic: topic.trim() || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate lecture.");
        return;
      }

      toast.success("Lecture generated! A reading task was added too. 📚");
      setTopic("");
      setShowInput(false);

      // Navigate to the new lecture
      router.push(`/courses/${course.id}/lectures/${data.lecture.id}`);
      router.refresh();

    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="clay-card" style={{ padding: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={15} style={{ color: "white" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              AI Lectures
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              Generated from your uploaded materials
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInput(!showInput)}
          className="btn-primary"
          style={{ fontSize: "0.8125rem", padding: "0.5rem 0.875rem" }}
          disabled={generating}
        >
          <Plus size={14} /> Generate Lecture
        </button>
      </div>

      {/* Topic input */}
      {showInput && (
        <div style={{
          padding: "1rem",
          background: "var(--color-surface-50)",
          borderRadius: "10px",
          border: "1px solid var(--color-surface-200)",
          marginBottom: "1rem",
        }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.625rem" }}>
            What topic should this lecture cover?
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.875rem" }}>
            Leave blank to auto-detect from your uploaded documents.
          </p>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <input
              className="clay-input"
              placeholder="e.g. System Design Principles, OOP Concepts..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateLecture()}
              disabled={generating}
            />
            <button
              onClick={generateLecture}
              disabled={generating}
              className="btn-primary"
              style={{ flexShrink: 0, minWidth: "100px" }}
            >
              {generating
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating...</>
                : <><Sparkles size={14} /> Generate</>
              }
            </button>
          </div>
          {generating && (
            <p style={{
              fontSize: "0.8rem", color: "var(--color-primary-600)",
              marginTop: "0.625rem", fontStyle: "italic",
            }}>
              Reading your documents and generating a full lecture... this takes 15-30 seconds ⏳
            </p>
          )}
        </div>
      )}

      {/* Lecture list */}
      {lectures.length === 0 ? (
        <div style={{
          padding: "2rem", textAlign: "center",
          background: "var(--color-surface-50)",
          borderRadius: "10px",
          border: "1px dashed var(--color-surface-300)",
        }}>
          <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📖</p>
          <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.375rem", fontSize: "0.9rem" }}>
            No lectures yet
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            Upload your course materials first, then click "Generate Lecture".
            UNIMIND will read everything and write a clear, easy-to-understand lecture for you.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {lectures.map((lecture) => (
            <Link
              key={lecture.id}
              href={`/courses/${course.id}/lectures/${lecture.id}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: "0.875rem",
                padding: "1rem 1.125rem",
                borderRadius: "10px",
                background: lecture.is_read ? "var(--color-surface-100)" : "var(--color-surface-50)",
                border: `1px solid ${lecture.is_read ? "var(--color-surface-300)" : "var(--color-primary-100)"}`,
                transition: "all 0.15s",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-primary-50)";
                  e.currentTarget.style.borderColor = "var(--color-primary-200)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = lecture.is_read ? "var(--color-surface-100)" : "var(--color-surface-50)";
                  e.currentTarget.style.borderColor = lecture.is_read ? "var(--color-surface-200)" : "var(--color-primary-100)";
                }}
              >
                {/* Icon */}
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: lecture.is_read
                    ? "var(--color-surface-100)"
                    : `${course.color ?? "#6366f1"}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <BookOpen
                    size={17}
                    style={{ color: lecture.is_read ? "#a8a29e" : (course.color ?? "#6366f1") }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: "0.875rem", fontWeight: 600,
                    color: lecture.is_read ? "var(--color-text-muted)" : "var(--color-text-primary)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    marginBottom: "0.25rem",
                    textDecoration: lecture.is_read ? "line-through" : "none",
                  }}>
                    {lecture.title}
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <span style={{
                      display: "flex", alignItems: "center", gap: "0.25rem",
                      fontSize: "0.75rem", color: "var(--color-text-muted)",
                    }}>
                      <Clock size={11} /> {lecture.read_time} min
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
                      {new Date(lecture.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </span>
                    {!lecture.is_read && (
                      <span className="clay-badge" style={{
                        background: "var(--color-primary-50)",
                        color: "var(--color-primary-600)",
                        fontSize: "0.7rem",
                      }}>
                        New
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight size={16} style={{ color: "#c9bfb3", flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}