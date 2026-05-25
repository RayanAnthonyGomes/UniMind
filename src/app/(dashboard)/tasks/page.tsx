// src/app/(dashboard)/tasks/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TasksClient from "@/components/tasks/TasksClient";

export const metadata = { title: "Tasks" };

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: tasks },
    { data: courses },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("courses")
      .select("id, name, color")
      .eq("user_id", user.id)
      .eq("is_active", true),
  ]);

  return (
    <div className="animate-fade-in">
      <TasksClient
        initialTasks={tasks ?? []}
        courses={courses ?? []}
        userId={user.id}
      />
    </div>
  );
}