// src/components/tasks/AddTaskModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";
import type { Task } from "@/types";

interface Course { id: string; name: string; color: string; }

const TASK_TYPES = [
  { value: "homework",     label: "📝 Homework"     },
  { value: "assignment",   label: "📌 Assignment"   },
  { value: "lab_report",   label: "🔬 Lab Report"   },
  { value: "presentation", label: "📊 Presentation" },
  { value: "quiz",         label: "✏️ Quiz"          },
  { value: "other",        label: "📎 Other"         },
];

const PRIORITIES = [
  { value: "high",   label: "🔴 High"   },
  { value: "medium", label: "🟡 Medium" },
  { value: "low",    label: "🟢 Low"    },
];

const STATUSES = [
  { value: "pending",     label: "⏳ Pending"     },
  { value: "in_progress", label: "🚀 In Progress" },
  { value: "done",        label: "✅ Done"         },
];

interface FormState {
  title:       string;
  description: string;
  type:        string;
  priority:    string;
  status:      string;
  due_date:    string;
  due_time:    string;
  course_id:   string;
}

interface Props {
  task?:    Task | null;
  courses:  Course[];
  userId:   string;
  onClose:  () => void;
  onSaved:  (task: Task, isEdit: boolean) => void;
}

export default function AddTaskModal({ task, courses, userId, onClose, onSaved }: Props) {
  const supabase = createClient();
  const isEdit   = !!task;

  const [form,    setForm]    = useState<FormState>({
    title:       task?.title       ?? "",
    description: task?.description ?? "",
    type:        task?.type        ?? "assignment",
    priority:    task?.priority    ?? "medium",
    status:      task?.status      ?? "pending",
    due_date:    task?.due_date    ? task.due_date.split("T")[0]! : "",
    due_time:    task?.due_date    ? task.due_date.split("T")[1]?.slice(0, 5) ?? "" : "",
    course_id:   task?.course_id   ?? "",
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const due_date = form.due_date
      ? `${form.due_date}T${form.due_time || "23:59"}:00`
      : null;

    const payload = {
      user_id:      userId,
      title:        form.title.trim(),
      description:  form.description.trim() || null,
      type:         form.type,
      priority:     form.priority,
      status:       form.status,
      due_date,
      course_id:    form.course_id || null,
      ai_generated: false,
    };

    if (isEdit && task) {
      const { data, error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", task.id)
        .select()
        .single();

      if (error) { toast.error("Failed to update task."); setLoading(false); return; }
      toast.success("Task updated! ✏️");
      onSaved(data as Task, true);
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .insert(payload)
        .select()
        .single();

      if (error) { toast.error("Failed to add task."); setLoading(false); return; }
      toast.success("Task added! 📋");
      onSaved(data as Task, false);
    }

    setLoading(false);
  }

  // ── Today string for min date ──────────────────────────────
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="clay-card animate-slide-up"
        style={{ width: "100%", maxWidth: "520px", padding: "2rem", maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1c1917" }}>
              {isEdit ? "Edit Task" : "Add New Task"}
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#78716c", marginTop: "0.25rem" }}>
              {isEdit ? "Update the details below" : "Fill in the details for your task"}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: "var(--color-surface-100)", border: "1px solid var(--color-surface-200)",
                     borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <X size={16} style={{ color: "#78716c" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Title */}
          <Field label="Task Title *" error={errors.title}>
            <input
              className="clay-input"
              placeholder="e.g. Data Structures Assignment 3"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              autoFocus
            />
          </Field>

          {/* Description */}
          <Field label="Description (optional)">
            <textarea
              className="clay-input"
              placeholder="Add any extra details, requirements, or notes..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>

          {/* Type + Priority row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Task Type">
              <select className="clay-input" value={form.type}
                onChange={(e) => set("type", e.target.value)} style={{ cursor: "pointer" }}>
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select className="clay-input" value={form.priority}
                onChange={(e) => set("priority", e.target.value)} style={{ cursor: "pointer" }}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Status + Course row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Status">
              <select className="clay-input" value={form.status}
                onChange={(e) => set("status", e.target.value)} style={{ cursor: "pointer" }}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Linked Course (optional)">
              <select className="clay-input" value={form.course_id}
                onChange={(e) => set("course_id", e.target.value)} style={{ cursor: "pointer" }}>
                <option value="">No course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Due date + time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Due Date">
              <input
                type="date"
                className="clay-input"
                value={form.due_date}
                min={today!}
                onChange={(e) => set("due_date", e.target.value)}
                style={{ cursor: "pointer" }}
              />
            </Field>
            <Field label="Due Time (optional)">
              <input
                type="time"
                className="clay-input"
                value={form.due_time}
                onChange={(e) => set("due_time", e.target.value)}
                disabled={!form.due_date}
                style={{ cursor: form.due_date ? "pointer" : "not-allowed", opacity: form.due_date ? 1 : 0.5 }}
              />
            </Field>
          </div>

          {/* Preview strip */}
          <div style={{
            padding: "0.875rem 1rem", borderRadius: "10px",
            background: "var(--color-surface-50)",
            border: "1px solid var(--color-surface-200)",
            display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center",
          }}>
            <span style={{ fontSize: "0.8rem", color: "#78716c" }}>
              {TASK_TYPES.find((t) => t.value === form.type)?.label}
            </span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#c9bfb3" }} />
            <span style={{ fontSize: "0.8rem", color: "#78716c" }}>
              {PRIORITIES.find((p) => p.value === form.priority)?.label}
            </span>
            {form.due_date && (
              <>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#c9bfb3" }} />
                <span style={{ fontSize: "0.8rem", color: "#78716c" }}>
                  Due {new Date(form.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {form.due_time ? ` at ${form.due_time}` : ""}
                </span>
              </>
            )}
            {form.course_id && (
              <>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#c9bfb3" }} />
                <span style={{ fontSize: "0.8rem", color: "#78716c" }}>
                  {courses.find((c) => c.id === form.course_id)?.name}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading
                ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
                : isEdit ? "Update Task ✏️" : "Add Task 📋"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500,
                      color: "#44403c", marginBottom: "0.375rem" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.375rem" }}>{error}</p>}
    </div>
  );
}