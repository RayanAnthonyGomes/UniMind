// src/app/api/courses/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify course belongs to this user
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    // 1. Remove all files from Supabase Storage for this course
    const { data: documents } = await supabase
      .from("documents")
      .select("url")
      .eq("course_id", id);

    if (documents && documents.length > 0) {
      // Extract storage paths from public URLs
      const storagePaths = documents
        .map((d) => {
          try {
            const url = new URL(d.url);
            // Path after /storage/v1/object/public/unimind-files/
            const match = url.pathname.match(/\/unimind-files\/(.+)$/);
            return match ? match[1] : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as string[];

      if (storagePaths.length > 0) {
        await supabase.storage.from("unimind-files").remove(storagePaths);
      }
    }

    // 2. Delete all related DB rows (cascade order)
    await Promise.all([
      supabase.from("documents").delete().eq("course_id", id),
      supabase.from("class_logs").delete().eq("course_id", id),
      supabase.from("lectures").delete().eq("course_id", id).eq("user_id", user.id),
      supabase.from("grades").delete().eq("course_id", id).eq("user_id", user.id),
      supabase.from("tasks").delete().eq("course_id", id).eq("user_id", user.id),
    ]);

    // 3. Finally delete the course itself
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete course error:", err);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
