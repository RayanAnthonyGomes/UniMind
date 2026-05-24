// src/app/api/ai/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, userId, courseId } = await request.json();

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, university_name, degree_program, current_semester, current_cgpa")
      .eq("id", userId)
      .single();

    // Fetch active courses for context
    const { data: courses } = await supabase
      .from("courses")
      .select("name, category, credits, semester")
      .eq("user_id", userId)
      .eq("is_active", true);

    // Fetch pending tasks for context
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, type, due_date, priority, status")
      .eq("user_id", userId)
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(10);

    // Build system prompt with user context
    const systemPrompt = `You are UNIMIND AI, a smart and friendly academic assistant for university students.

STUDENT PROFILE:
- Name: ${profile?.first_name ?? "Student"}
- University: ${profile?.university_name ?? "Unknown"}
- Degree: ${profile?.degree_program ?? "Unknown"}
- Current Semester: ${profile?.current_semester ?? 1}
- Current CGPA: ${profile?.current_cgpa ?? "Not set"}

ACTIVE COURSES (${courses?.length ?? 0}):
${courses?.map((c) => `- ${c.name} (${c.category}, ${c.credits} credits)`).join("\n") ?? "No courses added yet"}

PENDING TASKS (${tasks?.length ?? 0}):
${tasks?.map((t) => `- [${t.type}] ${t.title} — Priority: ${t.priority}${t.due_date ? `, Due: ${new Date(t.due_date).toLocaleDateString()}` : ""}`).join("\n") ?? "No pending tasks"}

${courseId ? "This conversation is about a specific course. Focus on course-related help." : "This is a general conversation. Help with anything academic."}

GUIDELINES:
- Be warm, encouraging and concise
- Use the student's name occasionally
- Give actionable advice
- For math problems, show step-by-step solutions
- Suggest study techniques when relevant
- If asked about deadlines, reference the tasks above
- Keep responses focused and not too long unless detail is needed`;

    // Call Groq API
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
      const err = await groqRes.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const content  = groqData.choices?.[0]?.message?.content ?? "I couldn't generate a response.";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}