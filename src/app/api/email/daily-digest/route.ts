// src/app/api/email/daily-digest/route.ts
import { NextResponse }         from "next/server";
import { Resend }               from "resend";
import { createClient }         from "@/lib/supabase/server";
import { dailyDigestTemplate }  from "@/lib/email-templates";
import { getGreeting }          from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

const MOTIVATIONAL_LINES = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "You don't have to be great to start, but you have to start to be great.",
  "Every expert was once a beginner. Keep going.",
  "Your future self is watching you right now through your memories.",
  "Progress, not perfection.",
  "Discipline is choosing between what you want now and what you want most.",
  "The best time to start was yesterday. The next best time is right now.",
];

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [
      { data: profile  },
      { data: courses  },
      { data: tasks    },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("courses").select("id").eq("user_id", user.id).eq("is_active", true),
      supabase.from("tasks").select("*").eq("user_id", user.id).neq("status", "done"),
    ]);

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const overdueTasks  = (tasks ?? []).filter(
      (t) => t.due_date && new Date(t.due_date) < new Date()
    );
    const upcomingTasks = (tasks ?? [])
      .filter((t) => t.due_date && new Date(t.due_date) >= new Date())
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    const greeting         = getGreeting(profile.first_name);
    const motivationalLine = MOTIVATIONAL_LINES[
      Math.floor(Math.random() * MOTIVATIONAL_LINES.length)
    ]!;

    const html = dailyDigestTemplate({
      firstName:        profile.first_name,
      greeting,
      cgpa:             profile.current_cgpa?.toFixed(2) ?? "—",
      coursesCount:     courses?.length ?? 0,
      pendingTasks:     tasks?.length   ?? 0,
      overdueTasks:     overdueTasks.length,
      upcomingTasks:    upcomingTasks.map((t) => ({
        title:    t.title,
        due_date: t.due_date!,
        type:     t.type,
      })),
      motivationalLine,
    });

    const { error } = await resend.emails.send({
      from:    "UNIMIND <noreply@mail.ryangomes.space>",
      to: process.env.NODE_ENV === "production" ? user.email! : process.env.RESEND_TEST_EMAIL!,
      subject: `📚 Your UNIMIND Daily Digest — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`,
      html,
    });

    if (error) {
      console.error("Resend digest error:", error);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    // Create in-app notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      title:   "Daily Digest Sent",
      body:    "Your daily academic summary has been sent to your email.",
      type:    "system",
      link:    "/dashboard",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Daily digest error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}