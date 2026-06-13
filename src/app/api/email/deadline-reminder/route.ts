// src/app/api/email/deadline-reminder/route.ts
import { NextResponse }              from "next/server";
import { Resend }                    from "resend";
import { createClient }              from "@/lib/supabase/server";
import { deadlineReminderTemplate }  from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch profile + tasks due in next 3 days
    const [{ data: profile }, { data: tasks }] = await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, university_name")
        .eq("id", user.id)
        .single(),
      supabase
        .from("tasks")
        .select("title, type, due_date, priority, course_id")
        .eq("user_id", user.id)
        .neq("status", "done")
        .not("due_date", "is", null)
        .lte("due_date", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
        .order("due_date", { ascending: true }),
    ]);

    if (!profile || !tasks?.length) {
      return NextResponse.json({ message: "No upcoming tasks to remind about." });
    }

    // Fetch course names for tasks that have course_id
    const courseIds = [...new Set(tasks.map((t) => t.course_id).filter(Boolean))];
    let courseMap: Record<string, string> = {};

    if (courseIds.length) {
      const { data: courses } = await supabase
        .from("courses")
        .select("id, name")
        .in("id", courseIds as string[]);
      courseMap = Object.fromEntries((courses ?? []).map((c) => [c.id, c.name]));
    }

    const taskData = tasks.map((t) => ({
      title:    t.title,
      type:     t.type,
      due_date: t.due_date!,
      priority: t.priority,
      course:   t.course_id ? courseMap[t.course_id] : undefined,
    }));

    const html = deadlineReminderTemplate({
      firstName: profile.first_name,
      tasks:     taskData,
    });

    const { error } = await resend.emails.send({
      from:    "UniMind <noreply@mail.ryangomes.space>",
      to:      user.email!,
      subject: `⏰ You have ${tasks.length} deadline${tasks.length > 1 ? "s" : ""} coming up — UniMind`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Create in-app notification too
    await supabase.from("notifications").insert({
      user_id: user.id,
      title:   "Deadline Reminder Sent",
      body:    `We sent a reminder about ${tasks.length} upcoming task${tasks.length > 1 ? "s" : ""} to your email.`,
      type:    "task_due",
      link:    "/tasks",
    });

    return NextResponse.json({ success: true, count: tasks.length });
  } catch (err) {
    console.error("Deadline reminder error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}