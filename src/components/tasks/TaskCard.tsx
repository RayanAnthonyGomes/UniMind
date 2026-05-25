// src/components/tasks/TaskCard.tsx
"use client";

import { Clock, Edit2, Trash2, BookOpen, CheckCircle2, Circle, Loader } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";

interface Course { id: string; name: string; color: string; }

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  homework:     { label: "Homework",     bg: "#f0f9ff", color: "#0ea5e9" },
  assignment:   { label: "Assignment",   bg: "var(--color-primary-50)", color: "var(--color-primary-600)" },
  lab_report:   { label: "Lab Report",  bg: "#f0fdf4", color: "#22c55e" },
  presentation: { label: "Presentation",bg: "#fdf4ff", color: "#a855f7" },
  quiz:         { label: "Quiz",        bg: "#fffbeb", color: "#f59e0b" },
  other:        { label: "Other",       bg: "var(--color-surface-100)", color: "#78716c" },
};

const STATUS_CONFIG = {
  pending:     { icon: <Circle      size={20} />, color: "#a8a29e", label: "Pending"     },
  in_progress: { icon: <Loader      size={20} />, color: "#0ea5e9", label: "In Progress" },
  done:        { icon: <CheckCircle2 size={20} />, color: "#22c55e", label: "Done"        },
};

const PRIORITY_LEFT: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#22c55e",
};

export default function TaskCard({
  task, course, onCycleStatus, onEdit, onDelete,
}: {
  task:          Task;
  course?:       Course;
  onCycleStatus: () => void;
  onEdit:        () => void;
  onDelete:      () => void;
}) {
  const isOverdue = task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "done";

  const typeConf   = TYPE_CONFIG[task.type]   ?? TYPE_CONFIG.other!;
  const statusConf = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending!;

  return (
    <div
      className="clay-card"
      style={{
        padding: "1.125rem 1.25rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        borderLeft: `4px solid ${PRIORITY_LEFT[task.priority] ?? "#ccc"}`,
        opacity: task.status === "done" ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Status toggle */}
      <button
        onClick={onCycleStatus}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: statusConf.color, padding: "2px", flexShrink: 0,
          marginTop: "1px",
          transition: "transform 0.15s",
        }}
        title={`Status: ${statusConf.label} — click to advance`}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {statusConf.icon}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
          {/* Title */}
          <p style={{
            fontSize: "0.9375rem", fontWeight: 600, color: "#1c1917",
            textDecoration: task.status === "done" ? "line-through" : "none",
            flex: 1, minWidth: 0,
          }}>
            {task.title}
          </p>

          {/* Type badge */}
          <span className="clay-badge" style={{
            background: typeConf.bg,
            color:      typeConf.color,
            flexShrink: 0,
          }}>
            {typeConf.label}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p style={{
            fontSize: "0.8375rem", color: "#78716c",
            marginBottom: "0.5rem", lineHeight: 1.5,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Due date */}
          {task.due_date && (
            <span style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              fontSize: "0.8rem",
              color: isOverdue ? "var(--color-error)" : "#78716c",
              fontWeight: isOverdue ? 600 : 400,
            }}>
              <Clock size={12} />
              {isOverdue ? "Overdue · " : "Due "}
              {formatDate(task.due_date)}
            </span>
          )}

          {/* Course tag */}
          {course && (
            <span style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              fontSize: "0.8rem", color: "#78716c",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: course.color ?? "#6366f1", flexShrink: 0,
              }} />
              {course.name}
            </span>
          )}

          {/* AI badge */}
          {task.ai_generated && (
            <span className="clay-badge" style={{
              background: "var(--color-primary-50)",
              color: "var(--color-primary-600)",
              fontSize: "0.7rem",
            }}>
              ✨ AI
            </span>
          )}

          {/* Priority */}
          <span style={{
            fontSize: "0.75rem", fontWeight: 600, marginLeft: "auto",
            color: PRIORITY_LEFT[task.priority] ?? "#ccc",
          }}>
            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)} Priority
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
        <button
          onClick={onEdit}
          style={{
            padding: "6px", borderRadius: "8px", display: "flex",
            background: "var(--color-surface-100)",
            border: "1px solid var(--color-surface-200)",
            color: "#78716c", cursor: "pointer",
          }}
          title="Edit task"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: "6px", borderRadius: "8px", display: "flex",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "var(--color-error)", cursor: "pointer",
          }}
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}