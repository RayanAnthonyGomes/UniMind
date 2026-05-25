// src/app/(dashboard)/drawing-board/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DrawingBoardClient from "@/components/drawing/DrawingBoardClient";

export const metadata = { title: "Drawing Board" };

export default async function DrawingBoardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, color")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const { data: sessions } = await supabase
    .from("drawing_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    <DrawingBoardClient
      userId={user.id}
      courses={courses ?? []}
      recentSessions={sessions ?? []}
    />
  );
}