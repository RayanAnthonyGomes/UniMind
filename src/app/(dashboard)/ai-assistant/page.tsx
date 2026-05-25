// src/app/(dashboard)/ai-assistant/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AIAssistantClient from "@/components/ai/AIAssistantClient";

export const metadata = { title: "AI Assistant" };

export default async function AIAssistantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile  },
    { data: courses  },
    { data: tasks    },
    { data: history  },
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
      .select("title, type, due_date, priority, status")
      .eq("user_id", user.id)
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(15),
    supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("user_id", user.id)
      .is("course_id", null)
      .order("created_at", { ascending: true })
      .limit(100),
  ]);

  if (!profile) redirect("/login");

  return (
    <AIAssistantClient
      profile={profile}
      courses={courses ?? []}
      tasks={tasks ?? []}
      initialHistory={history ?? []}
      userId={user.id}
    />
  );
}