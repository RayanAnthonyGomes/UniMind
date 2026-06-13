// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getGreeting } from "@/lib/utils";
import DashboardCards from "@/components/dashboard/DashboardCards";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import DashboardChat from "@/components/dashboard/DashboardChat";
import {
  BookOpen, FileText, CheckSquare, TrendingUp,
} from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch everything in parallel
  const [
    { data: profile },
    { data: courses },
    { data: documents },
    { data: tasks },
    { data: semesterGpas },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("courses").select("*").eq("user_id", user.id).eq("is_active", true),
    supabase.from("documents").select("id").eq("user_id", user.id),
    supabase.from("tasks").select("*").eq("user_id", user.id).neq("status", "done"),
    supabase.from("semester_gpas").select("*").eq("user_id", user.id).order("semester"),
  ]);

  if (!profile) redirect("/login");

  const greeting = getGreeting(profile.first_name);

  // Build summary cards data
  const cards = [
    {
      label: "Active Courses",
      value: courses?.length ?? 0,
      icon:  <BookOpen size={20} />,
      color: "#818cf8",
      bg:    "rgba(129, 140, 248, 0.10)",
      sub:   "This semester",
      href:  "/courses",
    },
    {
      label: "Files Uploaded",
      value: documents?.length ?? 0,
      icon:  <FileText size={20} />,
      color: "#38bdf8",
      bg:    "rgba(56, 189, 248, 0.10)",
      sub:   "PDFs, PPTs, notes",
      href:  "/courses",
    },
    {
      label: "Pending Tasks",
      value: tasks?.length ?? 0,
      icon:  <CheckSquare size={20} />,
      color: "#fbbf24",
      bg:    "rgba(251, 191, 36, 0.10)",
      sub:   "Due soon",
      href:  "/tasks",
    },
    {
      label: "Current CGPA",
      value: profile.current_cgpa?.toFixed(2) ?? "0.00",
      icon:  <TrendingUp size={20} />,
      color: "#34d399",
      bg:    "rgba(52, 211, 153, 0.10)",
      sub:   `${semesterGpas?.length ?? 0} semesters tracked`,
      href:  "/grades",
    },
  ];

  // Categorise pending tasks
  const overdue   = tasks?.filter((t) => t.due_date && new Date(t.due_date) < new Date()) ?? [];
  const upcoming  = tasks?.filter((t) => t.due_date && new Date(t.due_date) >= new Date())
                         .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()) ?? [];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Greeting */}
      <div>
        <h1 style={{
          fontSize: "1.75rem", fontWeight: 700,
          marginBottom: "0.25rem",
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.03em",
        }}>
          <span className="animate-wave">👋</span>{" "}
          <span className="text-gradient">{greeting.slice(0, -2)}</span>
          <span>{greeting.slice(-2)}</span>
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
          {profile.university_name
            ? `${profile.degree_program} · Semester ${profile.current_semester}`
            : "Welcome to UniMind — let's get you set up!"}
        </p>
      </div>

      {/* Summary cards */}
      <DashboardCards cards={cards} />

      {/* Two column: upcoming tasks + overdue */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <UpcomingTasks tasks={upcoming} title="Upcoming" emptyMsg="You're all caught up! 🎉" />
        <UpcomingTasks tasks={overdue}  title="⚠️ Overdue" emptyMsg="Nothing overdue — great work!" isOverdue />
      </div>

      {/* AI Chatbox */}
      <DashboardChat userId={user.id} />
    </div>
  );
}