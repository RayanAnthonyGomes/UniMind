// src/components/tasks/TasksClient.tsx
"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Plus, CheckSquare, Clock, AlertCircle,
  CheckCircle2, Filter, Search,
} from "lucide-react";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import type { Task } from "@/types";

interface Course {
  id:    string;
  name:  string;
  color: string;
}

type FilterStatus   = "all" | "pending" | "in_progress" | "done";
type FilterPriority = "all" | "high" | "medium" | "low";
type FilterType     = "all" | "homework" | "assignment" | "lab_report" | "presentation" | "quiz" | "other";
type SortBy         = "due_date" | "priority" | "created_at" | "type";

const STATUS_TABS: { value: FilterStatus; label: string; icon: React.ReactNode }[] = [
  { value: "all",         label: "All",        icon: <Filter      size={14} /> },
  { value: "pending",     label: "Pending",    icon: <Clock       size={14} /> },
  { value: "in_progress", label: "In Progress",icon: <AlertCircle size={14} /> },
  { value: "done",        label: "Done",       icon: <CheckCircle2 size={14} /> },
];

export default function TasksClient({
  initialTasks, courses, userId,
}: {
  initialTasks: Task[];
  courses:      Course[];
  userId:       string;
}) {
  const supabase = createClient();

  const [tasks,          setTasks]          = useState<Task[]>(initialTasks);
  const [showModal,      setShowModal]      = useState(false);
  const [editingTask,    setEditingTask]    = useState<Task | null>(null);
  const [filterStatus,   setFilterStatus]   = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [filterType,     setFilterType]     = useState<FilterType>("all");
  const [sortBy,         setSortBy]         = useState<SortBy>("due_date");
  const [search,         setSearch]         = useState("");

  const stats = useMemo(() => ({
    total:       tasks.length,
    pending:     tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done:        tasks.filter((t) => t.status === "done").length,
    overdue:     tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
    ).length,
  }), [tasks]);

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (filterStatus   !== "all") result = result.filter((t) => t.status   === filterStatus);
    if (filterPriority !== "all") result = result.filter((t) => t.priority  === filterPriority);
    if (filterType     !== "all") result = result.filter((t) => t.type      === filterType);
    if (search.trim())            result = result.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === "due_date") {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority as keyof typeof order] ?? 2) -
               (order[b.priority as keyof typeof order] ?? 2);
      }
      if (sortBy === "type") return a.type.localeCompare(b.type);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return result;
  }, [tasks, filterStatus, filterPriority, filterType, search, sortBy]);

  async function cycleStatus(task: Task) {
    const next: Record<string, Task["status"]> = {
      pending:     "in_progress",
      in_progress: "done",
      done:        "pending",
    };
    const newStatus = next[task.status] ?? "pending";

    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));

    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    if (error) {
      toast.error("Failed to update status.");
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: task.status } : t));
    } else {
      const msgs: Record<string, string> = {
        in_progress: "Task started! 🚀",
        done:        "Task completed! 🎉",
        pending:     "Task moved back to pending.",
      };
      toast.success(msgs[newStatus] ?? "Updated!");
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) { toast.error("Failed to delete."); setTasks(initialTasks); }
    else { toast.success("Task deleted."); }
  }

  function onTaskSaved(task: Task, isEdit: boolean) {
    if (isEdit) setTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
    else setTasks((prev) => [task, ...prev]);
    setEditingTask(null); setShowModal(false);
  }

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem", fontFamily: "var(--font-display)" }}>
            Tasks
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            {stats.pending} pending · {stats.in_progress} in progress · {stats.done} done
            {stats.overdue > 0 && (
              <span style={{ color: "var(--color-error)", fontWeight: 600 }}>
                {" "}· {stats.overdue} overdue
              </span>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        {[
          { label: "Total",       value: stats.total,       color: "#818cf8", bg: "rgba(129, 140, 248, 0.12)" },
          { label: "Pending",     value: stats.pending,     color: "#fbbf24", bg: "rgba(251, 191, 36, 0.12)" },
          { label: "In Progress", value: stats.in_progress, color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)" },
          { label: "Done",        value: stats.done,        color: "#34d399", bg: "rgba(52, 211, 153, 0.12)" },
        ].map((s) => (
          <div key={s.label} className="glass-card-static" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="glass-card-static" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <Search size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
            <input className="clay-input" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "2.25rem" }} />
          </div>

          <select className="clay-input" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as FilterPriority)} style={{ width: "auto", cursor: "pointer" }}>
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select className="clay-input" value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)} style={{ width: "auto", cursor: "pointer" }}>
            <option value="all">All Types</option>
            <option value="homework">Homework</option>
            <option value="assignment">Assignment</option>
            <option value="lab_report">Lab Report</option>
            <option value="presentation">Presentation</option>
            <option value="quiz">Quiz</option>
            <option value="other">Other</option>
          </select>

          <select className="clay-input" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} style={{ width: "auto", cursor: "pointer" }}>
            <option value="due_date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="type">Sort by Type</option>
            <option value="created_at">Sort by Created</option>
          </select>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} onClick={() => setFilterStatus(tab.value)}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.4rem 1rem", borderRadius: "999px",
                fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                background: filterStatus === tab.value ? "linear-gradient(135deg, #7c3aed, #6366f1)" : "rgba(255, 255, 255, 0.04)",
                color:      filterStatus === tab.value ? "white" : "var(--color-text-secondary)",
                border:     filterStatus === tab.value ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
              }}>
              {tab.icon} {tab.label}
              <span style={{ padding: "1px 6px", borderRadius: "999px", fontSize: "0.7rem", background: filterStatus === tab.value ? "rgba(255,255,255,0.25)" : "rgba(255, 255, 255, 0.08)", color: filterStatus === tab.value ? "white" : "var(--color-text-muted)" }}>
                {tab.value === "all" ? stats.total : tab.value === "pending" ? stats.pending : tab.value === "in_progress" ? stats.in_progress : stats.done}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{tasks.length === 0 ? "📋" : "🔍"}</p>
          <h3 style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>{tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{tasks.length === 0 ? "Add your first task to start tracking your work" : "Try adjusting your filters or search term"}</p>
          {tasks.length === 0 && (<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Your First Task</button>)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} course={task.course_id ? courseMap[task.course_id] : undefined} onCycleStatus={() => cycleStatus(task)} onEdit={() => { setEditingTask(task); setShowModal(true); }} onDelete={() => deleteTask(task.id)} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (<AddTaskModal task={editingTask} courses={courses} userId={userId} onClose={() => { setShowModal(false); setEditingTask(null); }} onSaved={onTaskSaved} />)}
    </>
  );
}