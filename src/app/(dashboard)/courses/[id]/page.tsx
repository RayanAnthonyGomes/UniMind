// src/app/(dashboard)/courses/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import CourseHeader from "@/components/courses/CourseHeader";
import CourseUploader from "@/components/courses/CourseUploader";
import CourseDocuments from "@/components/courses/CourseDocuments";
import CourseChat from "@/components/courses/CourseChat";

interface Props {
  params: Promise<{ id: string }>;
}



export async function generateMetadata({ params }: Props) {
  const { id }   = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("name").eq("id", id).single();
  return { title: data?.name ?? "Course" };
}

export default async function CourseDetailPage({ params }: Props) {
  const { id }   = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!course) notFound();

const { data: documents } = await supabase
  .from("documents")
  .select("id, course_id, user_id, name, type, url, size, content, created_at")
  .eq("course_id", id)
  .order("created_at", { ascending: false });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Course header */}
      <CourseHeader course={course} documentCount={documents?.length ?? 0} />

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.75rem", alignItems: "start" }}>

        {/* Left: upload + documents */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <CourseUploader courseId={id} userId={user.id} />
          <CourseDocuments documents={documents ?? []} courseId={id} userId={user.id} />
        </div>

        {/* Right: course AI chat */}
        <CourseChat courseId={id} userId={user.id} courseName={course.name} />
      </div>
    </div>
  );
}