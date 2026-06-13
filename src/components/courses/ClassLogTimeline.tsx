"use client";

import { useState } from "react";
import { ClassLog } from "@/types";
import { Plus, Check, Clock, CalendarDays, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ClassLogTimeline({ logs, courseId }: { logs: ClassLog[], courseId: string }) {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!topic.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/class-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, topic, date })
      });
      
      if (!res.ok) throw new Error();
      
      toast.success("Topic logged successfully!");
      setTopic("");
      setShowInput(false);
      router.refresh();
    } catch {
      toast.error("Failed to save class log. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="clay-card" style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CalendarDays size={16} style={{ color: "white" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              Class Timeline
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              Track what was taught each day
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInput(!showInput)}
          className="btn-primary"
          style={{ fontSize: "0.8125rem", padding: "0.5rem 0.875rem", background: showInput ? "#3f3f46" : undefined }}
        >
          <Plus size={14} style={{ transform: showInput ? "rotate(45deg)" : "none", transition: "transform 0.2s" }} /> 
          {showInput ? "Close" : "Log Topic"}
        </button>
      </div>

      {/* Manual Input Form */}
      {showInput && (
        <div style={{
          padding: "1rem",
          background: "var(--color-surface-50)",
          borderRadius: "10px",
          border: "1px solid var(--color-surface-200)",
          marginBottom: "1.5rem",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              type="date"
              className="clay-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "130px" }}
            />
            <input
              className="clay-input"
              style={{ flex: 1, minWidth: "200px" }}
              placeholder="e.g. Introduction to Binary Trees..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={submitting}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !topic.trim()}
              className="btn-primary"
              style={{ padding: "0 1rem" }}
            >
              {submitting ? "Saving..." : <Check size={16} />}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
            <Sparkles size={12} style={{ color: "#6366f1" }} />
            <p style={{ fontSize: "0.75rem", color: "#78716c", margin: 0 }}>
              Tip: You can also just type "I learned about X today" in the course chat!
            </p>
          </div>
        </div>
      )}

      {/* Timeline List */}
      {logs.length === 0 ? (
        <div style={{
          padding: "2rem", textAlign: "center",
          background: "var(--color-surface-50)",
          borderRadius: "10px",
          border: "1px dashed var(--color-surface-300)",
        }}>
          <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📅</p>
          <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.375rem", fontSize: "0.9rem" }}>
            No topics logged yet
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            Keep track of what's taught each day. Log it here or tell the AI assistant.
          </p>
        </div>
      ) : (
        <div style={{ position: "relative", paddingLeft: "0.75rem" }}>
          {/* Timeline continuous line */}
          <div style={{
            position: "absolute",
            left: "1rem",
            top: "0.5rem",
            bottom: "0.5rem",
            width: "2px",
            background: "var(--color-surface-200)",
            zIndex: 0
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {logs.map((log) => (
              <div key={log.id} style={{ position: "relative", zIndex: 1, display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                {/* Timeline dot */}
                <div style={{
                  width: "12px", height: "12px",
                  borderRadius: "50%",
                  background: "#10b981",
                  border: "2px solid var(--color-surface-100)",
                  boxShadow: "0 0 0 1px var(--color-surface-200)",
                  marginTop: "0.375rem",
                  flexShrink: 0
                }} />
                
                {/* Log card */}
                <div style={{
                  flex: 1,
                  background: "var(--color-surface-50)",
                  padding: "0.875rem 1.25rem",
                  borderRadius: "12px",
                  border: "1px solid var(--color-surface-200)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                    <Clock size={12} style={{ color: "#a8a29e" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
                      {new Date(log.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                    {log.topic}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
