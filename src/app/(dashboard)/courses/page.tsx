// // src/app/(dashboard)/courses/page.tsx
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
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.25rem" }}>
            My Courses
          </h1>
          <p style={{ color: "#78716c", fontSize: "0.9375rem" }}>
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
            background: "var(--color-primary-50)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.5rem",
          }}>
            <BookOpen size={36} style={{ color: "var(--color-primary-400)" }} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>
            No courses yet
          </h2>
          <p style={{ color: "#78716c", marginBottom: "1.5rem", maxWidth: "360px", lineHeight: 1.6 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#44403c" }}>
              Semester {sem}
            </h2>
            <div style={{ flex: 1, height: "1px", background: "var(--color-surface-200)" }} />
            <span className="clay-badge" style={{
              background: "var(--color-surface-100)",
              border: "1px solid var(--color-surface-200)",
              color: "#78716c",
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

// // src/app/(dashboard)/courses/[id]/page.tsx
// import { createClient } from "@/lib/supabase/server";
// import { redirect, notFound } from "next/navigation";
// import CourseHeader    from "@/components/courses/CourseHeader";
// import CourseUploader  from "@/components/courses/CourseUploader";
// import CourseDocuments from "@/components/courses/CourseDocuments";
// import CourseChat      from "@/components/courses/CourseChat";
// import LectureList     from "@/components/lectures/LectureList";

// interface Props {
//   params: Promise<{ id: string }>;
// }

// export async function generateMetadata({ params }: Props) {
//   const { id }   = await params;
//   const supabase = await createClient();
//   const { data } = await supabase.from("courses").select("name").eq("id", id).single();
//   return { title: data?.name ?? "Course" };
// }

// export default async function CourseDetailPage({ params }: Props) {
//   const { id }   = await params;
//   const supabase = await createClient();

//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/login");

//   const [
//     { data: course    },
//     { data: documents },
//     { data: lectures  },
//   ] = await Promise.all([
//     supabase.from("courses").select("*").eq("id", id).eq("user_id", user.id).single(),
//     supabase.from("documents").select("*").eq("course_id", id).order("created_at", { ascending: false }),
//     supabase.from("lectures").select("*").eq("course_id", id).eq("user_id", user.id).order("created_at", { ascending: false }),
//   ]);

//   if (!course) notFound();

//   return (
//     <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

//       <CourseHeader course={course} documentCount={documents?.length ?? 0} />

//       {/* Three column layout */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.75rem", alignItems: "start" }}>

//         {/* Left col: upload + documents + lectures */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
//           <CourseUploader  courseId={id} userId={user.id} />
//           <CourseDocuments documents={documents ?? []} courseId={id} userId={user.id} />
//           <LectureList
//             lectures={lectures ?? []}
//             course={{ id, name: course.name, color: course.color }}
//             userId={user.id}
//           />
//         </div>

//         {/* Right col: course AI chat */}
//         <CourseChat courseId={id} userId={user.id} courseName={course.name} />
//       </div>
//     </div>
//   );
// }