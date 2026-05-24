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
    <div className="clay-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {isOverdue
          ? <AlertCircle size={18} style={{ color: "var(--color-error)" }} />
          : <Clock size={18} style={{ color: "var(--color-primary-500)" }} />
        }
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917" }}>{title}</h2>
        {tasks.length > 0 && (
          <span className="clay-badge" style={{
            background: isOverdue ? "#fef2f2" : "var(--color-primary-50)",
            color:      isOverdue ? "var(--color-error)" : "var(--color-primary-600)",
            marginLeft: "auto",
          }}>
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div style={{
          padding: "1.5rem", textAlign: "center",
          background: "var(--color-surface-50)", borderRadius: "10px",
          border: "1px dashed var(--color-surface-300)",
        }}>
          <p style={{ color: "#a8a29e", fontSize: "0.875rem" }}>{emptyMsg}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem", borderRadius: "10px",
              background: "var(--color-surface-50)",
              border: "1px solid var(--color-surface-200)",
            }}>
              {/* Type badge */}
              <span style={{
                fontSize: "0.65rem", fontWeight: 700,
                padding: "2px 6px", borderRadius: "6px",
                background: isOverdue ? "#fef2f2" : "var(--color-primary-50)",
                color: isOverdue ? "var(--color-error)" : "var(--color-primary-600)",
                flexShrink: 0,
              }}>
                {TYPE_LABELS[task.type] ?? "OTH"}
              </span>

              {/* Title */}
              <p style={{ fontSize: "0.8375rem", fontWeight: 500, color: "#1c1917",
                          flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {task.title}
              </p>

              {/* Priority dot */}
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: PRIORITY_COLORS[task.priority] ?? "#ccc",
                flexShrink: 0,
              }} title={`${task.priority} priority`} />

              {/* Due date */}
              {task.due_date && (
                <span style={{ fontSize: "0.75rem", color: isOverdue ? "var(--color-error)" : "#a8a29e",
                               flexShrink: 0, fontWeight: isOverdue ? 600 : 400 }}>
                  {formatDate(task.due_date)}
                </span>
              )}
            </div>
          ))}

          {tasks.length > 5 && (
            <p style={{ fontSize: "0.8rem", color: "#a8a29e", textAlign: "center", paddingTop: "0.25rem" }}>
              +{tasks.length - 5} more — go to Tasks
            </p>
          )}
        </div>
      )}
    </div>
  );
}