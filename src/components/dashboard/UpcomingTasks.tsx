// src/components/dashboard/UpcomingTasks.tsx
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";
import { Clock, AlertCircle } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  homework:     "HW",
  assignment:   "AS",
  lab_report:   "LAB",
  presentation: "PRE",
  quiz:         "QZ",
  other:        "OTH",
};

const PRIORITY_COLORS: Record<string, string> = {
  high:   "var(--color-error)",
  medium: "var(--color-warning)",
  low:    "var(--color-success)",
};

export default function UpcomingTasks({
  tasks, title, emptyMsg, isOverdue = false,
}: {
  tasks:     Task[];
  title:     string;
  emptyMsg:  string;
  isOverdue?: boolean;
}) {
  return (
    <div className="glass-card-static" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {isOverdue
          ? <AlertCircle size={18} style={{ color: "var(--color-error)" }} />
          : <Clock size={18} style={{ color: "var(--color-primary-400)" }} />
        }
        <h2 style={{
          fontSize: "1rem", fontWeight: 700,
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-display)",
        }}>
          {title}
        </h2>
        {tasks.length > 0 && (
          <span style={{
            padding: "1px 7px", borderRadius: "999px",
            background: isOverdue ? "rgba(248, 113, 113, 0.10)" : "rgba(124, 58, 237, 0.12)",
            color:      isOverdue ? "var(--color-error)" : "var(--color-primary-300)",
            fontSize: "0.75rem", fontWeight: 700,
            marginLeft: "auto",
            border: `1px solid ${isOverdue ? "rgba(248, 113, 113, 0.15)" : "rgba(124, 58, 237, 0.15)"}`,
          }}>
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div style={{
          padding: "1.5rem", textAlign: "center",
          background: "rgba(255, 255, 255, 0.02)", borderRadius: "10px",
          border: "1px dashed rgba(255, 255, 255, 0.08)",
        }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{emptyMsg}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem", borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${isOverdue ? "rgba(248, 113, 113, 0.08)" : "rgba(255, 255, 255, 0.04)"}`,
              transition: "all 0.15s",
            }}>
              {/* Type badge */}
              <span style={{
                fontSize: "0.65rem", fontWeight: 700,
                padding: "2px 6px", borderRadius: "6px",
                background: isOverdue ? "rgba(248, 113, 113, 0.10)" : "rgba(124, 58, 237, 0.10)",
                color: isOverdue ? "var(--color-error)" : "var(--color-primary-300)",
                flexShrink: 0,
              }}>
                {TYPE_LABELS[task.type] ?? "OTH"}
              </span>

              {/* Title */}
              <p style={{
                fontSize: "0.8375rem", fontWeight: 500,
                color: "var(--color-text-primary)",
                flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {task.title}
              </p>

              {/* Priority dot */}
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: PRIORITY_COLORS[task.priority] ?? "var(--color-text-muted)",
                flexShrink: 0,
                boxShadow: `0 0 6px ${PRIORITY_COLORS[task.priority] ?? "transparent"}`,
              }} title={`${task.priority} priority`} />

              {/* Due date */}
              {task.due_date && (
                <span style={{
                  fontSize: "0.75rem",
                  color: isOverdue ? "var(--color-error)" : "var(--color-text-muted)",
                  flexShrink: 0, fontWeight: isOverdue ? 600 : 400,
                }}>
                  {formatDate(task.due_date)}
                </span>
              )}
            </div>
          ))}

          {tasks.length > 5 && (
            <p style={{
              fontSize: "0.8rem", color: "var(--color-text-muted)",
              textAlign: "center", paddingTop: "0.25rem",
            }}>
              +{tasks.length - 5} more — go to Tasks
            </p>
          )}
        </div>
      )}
    </div>
  );
}