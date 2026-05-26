// src/app/(dashboard)/motivation/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MotivationClient from "@/components/motivation/MotivationClient";

export const metadata = { title: "Motivation Hub" };

export default async function MotivationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile    },
    { data: courses    },
    { data: tasks      },
    { data: semGpas    },
    { data: summaries  },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("courses")
      .select("id, name, color, category")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("tasks")
      .select("status, due_date, priority")
      .eq("user_id", user.id),
    supabase
      .from("semester_gpas")
      .select("semester, sgpa")
      .eq("user_id", user.id)
      .order("semester"),
    supabase
      .from("ai_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "motivation")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (!profile) redirect("/login");

  // Calculate academic health score
  const totalTasks   = tasks?.length ?? 0;
  const doneTasks    = tasks?.filter((t) => t.status === "done").length ?? 0;
  const overdueTasks = tasks?.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
  ).length ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const cgpa           = profile.current_cgpa ?? 0;

  // Simple health score 0-100
  const healthScore = Math.min(100, Math.max(0, Math.round(
    (cgpa / 4) * 40 +
    completionRate * 0.4 +
    Math.max(0, 20 - overdueTasks * 5)
  )));

  return (
    <MotivationClient
      profile={profile}
      courses={courses ?? []}
      semGpas={semGpas ?? []}
      healthScore={healthScore}
      completionRate={completionRate}
      overdueTasks={overdueTasks}
      totalTasks={totalTasks}
      doneTasks={doneTasks}
      pastSummaries={summaries ?? []}
      userId={user.id}
    />
  );
}