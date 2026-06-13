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
        .select("id, name, category, credits, semester")
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

    // Fetch recent class logs across all courses (limit to 10 to save tokens)
    const courseMap: Record<string, string> = {};
    courses?.forEach((c) => { if (c.id) courseMap[c.id] = c.name; });

    const { data: recentLogs } = await supabase
      .from("class_logs")
      .select("topic, date, course_id")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(10);

    const systemPrompt = `You are UniMind AI — a highly intelligent, warm, and encouraging academic assistant built specifically for university students.

## STUDENT PROFILE
- Name: ${profile?.first_name} ${profile?.last_name}
- University: ${profile?.university_name ?? "Not set"}
- Degree: ${profile?.degree_program ?? "Not set"}
- Current Semester: ${profile?.current_semester ?? 1}
- Completed Semesters: ${profile?.completed_semesters ?? 0}
- Current CGPA: ${profile?.current_cgpa?.toFixed(2) ?? "Not tracked"}

## ACTIVE COURSES (${courses?.length ?? 0})
${courses?.map((c) => `- ${c.name} | ${c.category} | ${c.credits} credits | Semester ${c.semester} | course_id: ${c.id}`).join("\n") ?? "No courses added"}

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
- Never make up information about their courses or grades
- Today's date is ${new Date().toISOString().split("T")[0]}

## CLASS TOPIC LOG (what was taught per day)
${recentLogs && recentLogs.length > 0
  ? recentLogs.map((l) => `- [${l.date}] ${courseMap[l.course_id] ?? "Unknown course"}: ${l.topic}`).join("\n")
  : "No class topics logged yet — student hasn't recorded any class sessions."
}`;


    // Build Groq messages
    // If image is provided, use vision-capable model
    const hasImage = !!image;

    // Build message array for Groq — keep last 8 turns to save tokens
    const recentMessages = messages.slice(-8);
    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
      ...recentMessages.map((m: { role: string; content: string; image?: string }, idx: number) => {
        const isLast = idx === recentMessages.length - 1;

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
    const primaryModel = hasImage
      ? "meta-llama/llama-4-scout-17b-16e-instruct"   // Groq vision model
      : "llama-3.3-70b-versatile";
    const fallbackModel = "llama-3.1-8b-instant";     // Smaller model, separate TPM pool

    // Only add tools when NOT using vision model (vision model doesn't support tool calling)
    const supportsTools = !hasImage;
    const tools = supportsTools ? [
      {
        type: "function",
        function: {
          name: "log_class_topic",
          description: "Log what topic was taught in a specific course on a specific date. Call this whenever the user mentions what they learned or what was taught in class.",
          parameters: {
            type: "object",
            properties: {
              "course_id": { type: "string", description: "The UUID of the course. Use the course_id shown in the ACTIVE COURSES section of your context." },
              "date": { type: "string", description: "The date the topic was taught, in YYYY-MM-DD format. Use today's date if unspecified." },
              "topic": { type: "string", description: "A concise description of the topic taught, e.g. 'Binary Trees'." }
            },
            required: ["course_id", "date", "topic"]
          }
        }
      }
    ] : undefined;

    // Helper: call Groq with automatic retry on 429 (rate limit)
    async function groqFetch(body: object, retryOnRateLimit = true): Promise<Response> {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429 && retryOnRateLimit) {
        // Groq returns retry-after in seconds (float)
        const retryAfter = parseFloat(res.headers.get("retry-after") ?? "10");
        const waitMs = Math.min(retryAfter * 1000, 15_000); // cap at 15 s
        console.warn(`Groq rate limited — retrying in ${waitMs}ms`);
        await new Promise((r) => setTimeout(r, waitMs));

        // Retry once with the same body
        const retried = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify(body),
        });

        // Still rate limited — switch to fallback model (different TPM pool)
        if (retried.status === 429) {
          console.warn("Groq still rate limited after retry — switching to fallback model");
          const bodyObj = body as Record<string, unknown>;
          const fallbackBody = { ...bodyObj, model: fallbackModel, tools: undefined, tool_choice: undefined };
          return fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type":  "application/json",
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify(fallbackBody),
          });
        }

        return retried;
      }

      return res;
    }

    let groqRes = await groqFetch({
      model:       primaryModel,
      max_tokens:  1024,
      temperature: 0.7,
      messages:    groqMessages,
      ...(tools ? { tools, tool_choice: "auto" } : {}),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", errText);
      return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
    }

    let groqData = await groqRes.json();
    let responseMessage = groqData.choices?.[0]?.message;

    if (responseMessage?.tool_calls) {
      groqMessages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === "log_class_topic") {
          const args = JSON.parse(toolCall.function.arguments);
          
          const { error } = await supabase.from("class_logs").insert({
            user_id: user.id,
            course_id: args.course_id,
            date: args.date,
            topic: args.topic,
          });

          groqMessages.push({
            role: "tool",
            // @ts-ignore
            tool_call_id: toolCall.id,
            content: error ? "Failed to save to database." : `Successfully logged topic: ${args.topic}`,
          });
        }
      }

      groqRes = await groqFetch({
        model:       primaryModel,
        max_tokens:  1024,
        temperature: 0.7,
        messages:    groqMessages,
      });

      if (!groqRes.ok) {
        console.error("Groq 2nd call error:", await groqRes.text());
        return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
      }

      groqData = await groqRes.json();
      responseMessage = groqData.choices?.[0]?.message;
    }

    const content  = responseMessage?.content ?? "I couldn't generate a response.";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Assistant API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}