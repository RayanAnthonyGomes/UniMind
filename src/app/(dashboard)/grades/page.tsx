// src/app/(dashboard)/grades/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GradesOverview from "@/components/grades/GradesOverview";
import SemesterGPAChart from "@/components/grades/SemesterGPAChart";
import CourseGradeList from "@/components/grades/CourseGradeList";

export const metadata = { title: "Grades" };

export default async function GradesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: courses },
    { data: grades },
    { data: semesterGpas },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("courses").select("*").eq("user_id", user.id).eq("is_active", true),
    supabase.from("grades").select("*").eq("user_id", user.id),
    supabase.from("semester_gpas").select("*").eq("user_id", user.id).order("semester"),
  ]);

  // Map grades by course_id for easy lookup
  const gradesByCourse = (grades ?? []).reduce<Record<string, any>>(
    (acc, g) => { if (g) acc[g.course_id] = g; return acc; },
    {}
  ); //copilot did smth here, not sure what it was but it seems to work fine

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.25rem" }}>
          Grades & CGPA
        </h1>
        <p style={{ color: "#78716c", fontSize: "0.9375rem" }}>
          Track your academic performance across all courses
        </p>
      </div>

      {/* CGPA Overview cards */}
      <GradesOverview
        profile={profile!}
        semesterGpas={semesterGpas ?? []}
        courseCount={courses?.length ?? 0}
      />

      {/* Semester CGPA chart */}
      {(semesterGpas?.length ?? 0) > 0 && (
        <SemesterGPAChart semesterGpas={semesterGpas ?? []} />
      )}

      {/* Course grade entries */}
      <CourseGradeList
        courses={courses ?? []}
        gradesByCourse={gradesByCourse}
        userId={user.id}
      />
    </div>
  );
}