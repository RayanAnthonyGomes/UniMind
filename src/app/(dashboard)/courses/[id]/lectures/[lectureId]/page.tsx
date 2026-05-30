// src/app/(dashboard)/courses/[id]/lectures/[lectureId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import LectureReader from "@/components/lectures/LectureReader";

interface Props {
  params: Promise<{ id: string; lectureId: string }>;
}

export default async function LecturePage({ params }: Props) {
  const { id, lectureId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: lecture }, { data: course }] = await Promise.all([
    supabase
      .from("lectures")
      .select("*")
      .eq("id", lectureId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("courses")
      .select("name, color")
      .eq("id", id)
      .single(),
  ]);

  if (!lecture || !course) notFound();

  // Mark as read
  await supabase
    .from("lectures")
    .update({ is_read: true })
    .eq("id", lectureId);

  return <LectureReader lecture={lecture} course={course} courseId={id} />;
}