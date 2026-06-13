// src/app/(dashboard)/courses/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AddCourseButton from "@/components/courses/AddCourseButton";
import CourseCard from "@/components/courses/CourseCard";
import { BookOpen, Plus } from "lucide-react";

export const metadata = { title: "Courses" };

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_semester")
    .eq("id", user.id)
    .single();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Group by semester
  const bySemester = (courses ?? []).reduce<Record<number, typeof courses>>(
    (acc, course) => {
      const sem = course!.semester;
      if (!acc[sem]) acc[sem] = [];
      acc[sem]!.push(course);
      return acc;
    },
    {}
  );

  const semesterKeys = Object.keys(bySemester)
    .map(Number)
    .sort((a, b) => b - a); // newest first

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{
            fontSize: "1.75rem", fontWeight: 700,
            color: "var(--color-text-primary)", marginBottom: "0.25rem",
            fontFamily: "var(--font-display)", letterSpacing: "-0.03em"
          }}>
            My Courses
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            {courses?.length
              ? `${courses.length} course${courses.length > 1 ? "s" : ""} across ${semesterKeys.length} semester${semesterKeys.length > 1 ? "s" : ""}`
              : "Add your first course to get started"}
          </p>
        </div>
        <AddCourseButton currentSemester={profile?.current_semester ?? 1} userId={user.id} />
      </div>

      {/* Empty state */}
      {(!courses || courses.length === 0) && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "5rem 2rem", textAlign: "center",
        }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "rgba(124, 58, 237, 0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.5rem",
            boxShadow: "0 0 25px -5px rgba(124, 58, 237, 0.3)"
          }}>
            <BookOpen size={36} style={{ color: "var(--color-primary-400)" }} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            No courses yet
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", maxWidth: "360px", lineHeight: 1.6 }}>
            Add your courses for this semester and UNIMIND will help you
            track everything — materials, grades, tasks and more.
          </p>
          <AddCourseButton
            currentSemester={profile?.current_semester ?? 1}
            userId={user.id}
            label="Add Your First Course"
          />
        </div>
      )}

      {/* Courses grouped by semester */}
      {semesterKeys.map((sem) => (
        <section key={sem}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              Semester {sem}
            </h2>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
            <span style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--color-text-muted)",
              padding: "0.2rem 0.6rem", borderRadius: "999px",
              fontSize: "0.75rem", fontWeight: 600,
            }}>
              {bySemester[sem]?.length} course{(bySemester[sem]?.length ?? 0) > 1 ? "s" : ""}
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}>
            {bySemester[sem]?.map((course) => (
              <CourseCard key={course!.id} course={course!} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}