// src/app/api/ai/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, userId, courseId } = await request.json();

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, university_name, degree_program, current_semester, current_cgpa")
      .eq("id", userId)
      .single();

    // Fetch course details if in course context
    let courseContext = "";
    if (courseId) {
      const { data: course } = await supabase
        .from("courses")
        .select("name, category, credits, semester")
        .eq("id", courseId)
        .single();

      const { data: docs } = await supabase
        .from("documents")
        .select("name, type")
        .eq("course_id", courseId)
        .eq("user_id", userId);

      if (course) {
        courseContext = `
CURRENT COURSE CONTEXT:
- Course: ${course.name}
- Category: ${course.category}
- Credits: ${course.credits}
- Semester: ${course.semester}
- Uploaded Materials (${docs?.length ?? 0}):
${docs?.map((d) => `  · ${d.name} (${d.type})`).join("\n") ?? "  None yet"}

Focus all responses on this specific course. Reference the uploaded materials when relevant.`;
      }
    }

    // Fetch active courses for general context
    const { data: courses } = await supabase
      .from("courses")
      .select("name, category, credits")
      .eq("user_id", userId)
      .eq("is_active", true);

    // Fetch pending tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, type, due_date, priority")
      .eq("user_id", userId)
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(10);

    const systemPrompt = `You are UNIMIND AI, a smart, warm and encouraging academic assistant for university students.

STUDENT PROFILE:
- Name: ${profile?.first_name ?? "Student"}
- University: ${profile?.university_name ?? "Not set"}
- Degree: ${profile?.degree_program ?? "Not set"}
- Current Semester: ${profile?.current_semester ?? 1}
- Current CGPA: ${profile?.current_cgpa ?? "Not tracked yet"}

${courseContext || `ALL ACTIVE COURSES:
${courses?.map((c) => `- ${c.name} (${c.category}, ${c.credits} credits)`).join("\n") ?? "No courses added yet"}`}

PENDING TASKS:
${tasks?.map((t) => `- [${t.type}] ${t.title}${t.due_date ? ` — Due: ${new Date(t.due_date).toLocaleDateString()}` : ""} (${t.priority} priority)`).join("\n") ?? "No pending tasks"}

GUIDELINES:
- Be warm, concise, and encouraging
- Use the student's first name occasionally
- For math: show clear step-by-step solutions
- For study plans: be specific and realistic
- Reference their actual courses and tasks when relevant
- Keep responses focused — don't over-explain unless asked
- If they seem stressed, be extra encouraging`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        max_tokens:  1024,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role:    m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq error:", await groqRes.text());
      return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const content  = groqData.choices?.[0]?.message?.content ?? "I couldn't generate a response.";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}