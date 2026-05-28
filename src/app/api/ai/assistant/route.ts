// src/app/api/ai/assistant/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, userId, image } = await request.json();

    // Fetch full student context
    const [
      { data: profile     },
      { data: courses     },
      { data: tasks       },
      { data: grades      },
      { data: semGpas     },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single(),
      supabase
        .from("courses")
        .select("name, category, credits, semester")
        .eq("user_id", userId)
        .eq("is_active", true),
      supabase
        .from("tasks")
        .select("title, type, due_date, priority, status")
        .eq("user_id", userId)
        .neq("status", "done")
        .order("due_date", { ascending: true })
        .limit(20),
      supabase
        .from("grades")
        .select("course_id, quiz_marks, midterm_mark, final_mark, sgpa")
        .eq("user_id", userId),
      supabase
        .from("semester_gpas")
        .select("semester, sgpa")
        .eq("user_id", userId)
        .order("semester"),
    ]);

    const overdue = (tasks ?? []).filter(
      (t) => t.due_date && new Date(t.due_date) < new Date()
    );

    const systemPrompt = `You are UNIMIND AI — a highly intelligent, warm, and encouraging academic assistant built specifically for university students.

## STUDENT PROFILE
- Name: ${profile?.first_name} ${profile?.last_name}
- University: ${profile?.university_name ?? "Not set"}
- Degree: ${profile?.degree_program ?? "Not set"}
- Current Semester: ${profile?.current_semester ?? 1}
- Completed Semesters: ${profile?.completed_semesters ?? 0}
- Current CGPA: ${profile?.current_cgpa?.toFixed(2) ?? "Not tracked"}

## ACTIVE COURSES (${courses?.length ?? 0})
${courses?.map((c) => `- ${c.name} | ${c.category} | ${c.credits} credits | Semester ${c.semester}`).join("\n") ?? "No courses added"}

## PENDING TASKS (${tasks?.length ?? 0})
${tasks?.map((t) =>
  `- [${t.type.toUpperCase()}] ${t.title} | Priority: ${t.priority} | Status: ${t.status}${t.due_date ? ` | Due: ${new Date(t.due_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}` : ""}`
).join("\n") ?? "No pending tasks"}

## OVERDUE (${overdue.length})
${overdue.length ? overdue.map((t) => `- ${t.title} (${t.type})`).join("\n") : "None — great job!"}

## SEMESTER GPA HISTORY
${semGpas?.map((s) => `- Semester ${s.semester}: ${s.sgpa.toFixed(2)}`).join("\n") ?? "No GPA history"}

## YOUR CAPABILITIES
- Solve math problems step by step (especially from uploaded images)
- Analyze academic performance and suggest improvements
- Create personalized study plans and schedules
- Explain complex concepts clearly with examples
- Help write, structure and improve academic work
- Answer questions about any subject
- Provide motivation and mental health support
- Suggest resources (books, videos, websites)

## GUIDELINES
- Always use ${profile?.first_name}'s name occasionally to feel personal
- For math: show every step clearly, explain each operation
- For study plans: be specific with times and topics
- For explanations: use simple language first, then detail
- For motivation: be genuine and reference their actual progress
- Keep responses well-structured using headers and bullet points
- If they seem stressed or overwhelmed, acknowledge it warmly first
- Reference their actual courses, tasks and grades when relevant
- NEVER use LaTeX notation. Never wrap math in dollar signs.
- Write math as plain text: "x = 5", "x^2", "sqrt(9) = 3"
- Use **bold** for emphasis, numbered lists for steps
- Never make up information about their courses or grades`;


    // Build Groq messages
    // If image is provided, use vision-capable model
    const hasImage = !!image;

    // Build message array for Groq
    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.slice(-20).map((m: { role: string; content: string; image?: string }, idx: number) => {
        const isLast = idx === messages.length - 1;

        // If this is the last message and has an image, send as multimodal
        if (isLast && m.image && hasImage) {
          return {
            role: "user" as const,
            content: [
              {
                type: "image_url" as const,
                image_url: { url: m.image },
              },
              {
                type: "text" as const,
                text: m.content || "Please analyze this image and help me solve/understand it step by step.",
              },
            ],
          };
        }

        return {
          role:    m.role as "user" | "assistant",
          content: m.content || "[Image]",
        };
      }),
    ];

    // Use vision model if image present, else fast model
    const model = hasImage
      ? "meta-llama/llama-4-scout-17b-16e-instruct"   // Groq vision model
      : "llama-3.3-70b-versatile";

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens:  2048,
        temperature: 0.7,
        messages:    groqMessages,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", errText);
      return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const content  = groqData.choices?.[0]?.message?.content ?? "I couldn't generate a response.";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Assistant API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}