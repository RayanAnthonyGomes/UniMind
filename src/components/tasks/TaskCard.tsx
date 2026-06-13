// src/components/tasks/TaskCard.tsx
"use client";

import { Clock, Edit2, Trash2, BookOpen, CheckCircle2, Circle, Loader } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";

interface Course { id: string; name: string; color: string; }

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  homework:     { label: "Homework",     bg: "rgba(14, 165, 233, 0.15)", color: "#38bdf8" },
  assignment:   { label: "Assignment",   bg: "rgba(124, 58, 237, 0.15)", color: "#a78bfa" },
  lab_report:   { label: "Lab Report",   bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80" },
  presentation: { label: "Presentation", bg: "rgba(168, 85, 247, 0.15)", color: "#c084fc" },
  quiz:         { label: "Quiz",         bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
  other:        { label: "Other",        bg: "rgba(255, 255, 255, 0.05)", color: "var(--color-text-secondary)" },
};

const STATUS_CONFIG = {
  pending:     { icon: <Circle      size={20} />, color: "var(--color-text-muted)", label: "Pending"     },
  in_progress: { icon: <Loader      size={20} />, color: "#38bdf8", label: "In Progress" },
  done:        { icon: <CheckCircle2 size={20} />, color: "#4ade80", label: "Done"        },
};

const PRIORITY_LEFT: Record<string, string> = {
  high:   "#f87171",
  medium: "#fbbf24",
  low:    "#4ade80",
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
      style={{
        padding: "1.125rem 1.25rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        borderLeft: `4px solid ${PRIORITY_LEFT[task.priority] ?? "#ccc"}`,
        opacity: task.status === "done" ? 0.6 : 1,
        transition: "opacity 0.2s, transform 0.2s, background 0.2s",
        background: "rgba(255, 255, 255, 0.02)",
        borderRadius: "0 12px 12px 0",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
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
            fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)",
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
            border: `1px solid ${typeConf.color}40`,
          }}>
            {typeConf.label}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p style={{
            fontSize: "0.8375rem", color: "var(--color-text-secondary)",
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
              color: isOverdue ? "var(--color-error)" : "var(--color-text-muted)",
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
              fontSize: "0.8rem", color: "var(--color-text-muted)",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: course.color ?? "#818cf8", flexShrink: 0,
                boxShadow: `0 0 6px ${course.color ?? "#818cf8"}80`
              }} />
              {course.name}
            </span>
          )}

          {/* AI badge */}
          {task.ai_generated && (
            <span className="clay-badge" style={{
              background: "rgba(124, 58, 237, 0.15)",
              color: "var(--color-primary-300)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
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
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "var(--color-text-muted)", cursor: "pointer",
            transition: "all 0.15s"
          }}
          title="Edit task"
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: "6px", borderRadius: "8px", display: "flex",
            background: "rgba(248, 113, 113, 0.1)",
            border: "1px solid rgba(248, 113, 113, 0.2)",
            color: "var(--color-error)", cursor: "pointer",
            transition: "all 0.15s"
          }}
          title="Delete task"
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248, 113, 113, 0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)"; }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}