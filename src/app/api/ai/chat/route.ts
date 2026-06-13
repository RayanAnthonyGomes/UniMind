// // src/app/api/ai/chat/route.ts
// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";

// export async function POST(request: Request) {
//   try {
//     const supabase = await createClient();
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { messages, userId, courseId } = await request.json();

//     // Fetch user profile
//     const { data: profile } = await supabase
//       .from("profiles")
//       .select("first_name, university_name, degree_program, current_semester, current_cgpa")
//       .eq("id", userId)
//       .single();

//     // Fetch course details if in course context
//     let courseContext = "";
//     if (courseId) {
//       const { data: course } = await supabase
//         .from("courses")
//         .select("name, category, credits, semester")
//         .eq("id", courseId)
//         .single();

//       const { data: docs } = await supabase
//         .from("documents")
//         .select("name, type")
//         .eq("course_id", courseId)
//         .eq("user_id", userId);

//       if (course) {
//         courseContext = `
// CURRENT COURSE CONTEXT:
// - Course: ${course.name}
// - Category: ${course.category}
// - Credits: ${course.credits}
// - Semester: ${course.semester}
// - Uploaded Materials (${docs?.length ?? 0}):
// ${docs?.map((d) => `  · ${d.name} (${d.type})`).join("\n") ?? "  None yet"}

// Focus all responses on this specific course. Reference the uploaded materials when relevant.`;
//       }
//     }

//     // Fetch active courses for general context
//     const { data: courses } = await supabase
//       .from("courses")
//       .select("name, category, credits")
//       .eq("user_id", userId)
//       .eq("is_active", true);

//     // Fetch pending tasks
//     const { data: tasks } = await supabase
//       .from("tasks")
//       .select("title, type, due_date, priority")
//       .eq("user_id", userId)
//       .neq("status", "done")
//       .order("due_date", { ascending: true })
//       .limit(10);

//     const systemPrompt = `You are UniMind AI, a smart, warm and encouraging academic assistant for university students.

// STUDENT PROFILE:
// - Name: ${profile?.first_name ?? "Student"}
// - University: ${profile?.university_name ?? "Not set"}
// - Degree: ${profile?.degree_program ?? "Not set"}
// - Current Semester: ${profile?.current_semester ?? 1}
// - Current CGPA: ${profile?.current_cgpa ?? "Not tracked yet"}

// ${courseContext || `ALL ACTIVE COURSES:
// ${courses?.map((c) => `- ${c.name} (${c.category}, ${c.credits} credits)`).join("\n") ?? "No courses added yet"}`}

// PENDING TASKS:
// ${tasks?.map((t) => `- [${t.type}] ${t.title}${t.due_date ? ` — Due: ${new Date(t.due_date).toLocaleDateString()}` : ""} (${t.priority} priority)`).join("\n") ?? "No pending tasks"}

// GUIDELINES:
// - Be warm, concise, and encouraging
// - Use the student's first name occasionally
// - For math: show clear step-by-step solutions
// - For study plans: be specific and realistic
// - Reference their actual courses and tasks when relevant
// - Keep responses focused — don't over-explain unless asked
// - If they seem stressed, be extra encouraging`;

//     const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type":  "application/json",
//         "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model:       "llama-3.3-70b-versatile",
//         max_tokens:  1024,
//         temperature: 0.7,
//         messages: [
//           { role: "system", content: systemPrompt },
//           ...messages.map((m: { role: string; content: string }) => ({
//             role:    m.role,
//             content: m.content,
//           })),
//         ],
//       }),
//     });

//     if (!groqRes.ok) {
//       console.error("Groq error:", await groqRes.text());
//       return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
//     }

//     const groqData = await groqRes.json();
//     const content  = groqData.choices?.[0]?.message?.content ?? "I couldn't generate a response.";

//     return NextResponse.json({ content });
//   } catch (err) {
//     console.error("Chat error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
// src/app/api/ai/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, userId, courseId } = await request.json();

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, university_name, degree_program, current_semester, current_cgpa")
      .eq("id", userId)
      .single();

    // Fetch tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, type, due_date, priority, status")
      .eq("user_id", userId)
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(10);

    let courseContext   = "";
    let documentContext = "";
    let classLogContext = "";

    if (courseId) {
      // Course-specific context
      const { data: course } = await supabase
        .from("courses")
        .select("name, category, credits, semester")
        .eq("id", courseId)
        .single();

      // Fetch documents WITH their extracted text content
      const { data: docs } = await supabase
        .from("documents")
        .select("name, type, content")
        .eq("course_id", courseId)
        .eq("user_id", userId);

      // Fetch class logs for this course
      const { data: courseLogs } = await supabase
        .from("class_logs")
        .select("topic, date")
        .eq("course_id", courseId)
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(30);

      if (course) {
        courseContext = `CURRENT COURSE: ${course.name} | ${course.category} | ${course.credits} credits | Semester ${course.semester} | course_id: ${courseId}`;
      }

      if (docs && docs.length > 0) {
        const docsWithContent    = docs.filter((d) => d.content && d.content.length > 10);
        const docsWithoutContent = docs.filter((d) => !d.content || d.content.length <= 10);

        if (docsWithContent.length > 0) {
          documentContext = `
UPLOADED COURSE MATERIALS (${docsWithContent.length} indexed):
${docsWithContent.map((d) => `
--- ${d.name} (${d.type.toUpperCase()}) ---
${d.content!.slice(0, 3000)}
${d.content!.length > 3000 ? "... [truncated]" : ""}
`).join("\n")}`;
        }

        if (docsWithoutContent.length > 0) {
          documentContext += `\nFiles uploaded but not yet indexed: ${docsWithoutContent.map((d) => d.name).join(", ")}`;
        }
      }

      if (courseLogs && courseLogs.length > 0) {
        classLogContext = `
CLASS TOPIC LOG (${course?.name ?? "this course"}):
${courseLogs.map((l) => `- [${l.date}] ${l.topic}`).join("\n")}`;
      }

    } else {
      // Global context — fetch all courses with IDs
      const { data: courses } = await supabase
        .from("courses")
        .select("id, name, category, credits")
        .eq("user_id", userId)
        .eq("is_active", true);

      courseContext = `ACTIVE COURSES:\n${courses?.map((c) => `- ${c.name} (${c.category}, ${c.credits} credits) | course_id: ${c.id}`).join("\n") ?? "None added yet"}`;

      // Fetch all recent class logs
      const { data: recentLogs } = await supabase
        .from("class_logs")
        .select("topic, date, course_id")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(20);

      if (recentLogs && recentLogs.length > 0) {
        const courseMap: Record<string, string> = {};
        courses?.forEach((c) => { if (c.id) courseMap[c.id] = c.name; });
        classLogContext = `
RECENT CLASS LOGS (most recent first):
${recentLogs.map((l) => `- [${l.date}] ${courseMap[l.course_id] ?? "Unknown course"}: ${l.topic}`).join("\n")}`;
      }
    }

    const systemPrompt = `You are UniMind AI — a smart, warm academic assistant for university students.

STUDENT: ${profile?.first_name ?? "Student"} | ${profile?.university_name ?? "University"} | ${profile?.degree_program ?? "Degree"} | Semester ${profile?.current_semester ?? 1} | CGPA: ${profile?.current_cgpa?.toFixed(2) ?? "Not set"}

${courseContext}
${documentContext}
${classLogContext}

PENDING TASKS:
${tasks?.map((t) => `- [${t.type}] ${t.title}${t.due_date ? ` | Due: ${new Date(t.due_date).toLocaleDateString()}` : ""} | ${t.priority} priority`).join("\n") ?? "None"}

RESPONSE RULES — MUST FOLLOW:
- Write in plain, clear English. No LaTeX. No dollar signs around math.
- For math: write "x = 5" not "$x = 5$". Write "x^2" not "$x^{2}$".
- Use **bold** for key terms. Use numbered lists for steps.
- Be concise and warm. Use the student's name occasionally.
- If document content is provided above, reference it directly in your answers.
- For questions about uploaded materials, quote or summarize from the actual content.
- If the student asks what was taught today or on a specific date, use the CLASS TOPIC LOG above to answer. Today's date is ${new Date().toISOString().split("T")[0]}.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-20).map((m: { role: string; content: string }) => ({
        role:    m.role,
        content: m.content,
      })),
    ];

    const tools = [
      {
        type: "function",
        function: {
          name: "log_class_topic",
          description: "Save a topic that was taught in class on a specific date. ONLY call this when the student is telling you what was taught — not when they are asking a question about what was taught.",
          parameters: {
            type: "object",
            properties: {
              course_id: { type: "string", description: "UUID of the course from the CURRENT COURSE or ACTIVE COURSES context." },
              date:      { type: "string", description: "Date the topic was taught in YYYY-MM-DD format. Use today's date if not specified." },
              topic:     { type: "string", description: "Brief description of the topic taught, e.g. 'Binary Search Trees'." },
            },
            required: ["course_id", "date", "topic"],
          },
        },
      },
    ];

    let groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        max_tokens:  1024,
        temperature: 0.7,
        messages: formattedMessages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq error:", await groqRes.text());
      return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
    }

    let groqData      = await groqRes.json();
    let responseMsg   = groqData.choices?.[0]?.message;

    // Handle tool calls (AI wants to log a topic)
    if (responseMsg?.tool_calls) {
      const followUpMessages = [...formattedMessages, responseMsg];

      for (const toolCall of responseMsg.tool_calls) {
        if (toolCall.function.name === "log_class_topic") {
          const args = JSON.parse(toolCall.function.arguments);

          const { error: dbErr } = await supabase.from("class_logs").insert({
            user_id:   user.id,
            course_id: args.course_id || courseId,
            date:      args.date,
            topic:     args.topic,
          });

          followUpMessages.push({
            role:         "tool",
            // @ts-ignore
            tool_call_id: toolCall.id,
            content:      dbErr ? "Failed to save to database." : `Logged: ${args.topic}`,
          });
        }
      }

      // Second Groq call to get a proper text reply
      const groqRes2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model:       "llama-3.3-70b-versatile",
          max_tokens:  1024,
          temperature: 0.7,
          messages: followUpMessages,
        }),
      });

      if (!groqRes2.ok) {
        console.error("Groq 2nd call error:", await groqRes2.text());
        return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
      }

      const groqData2 = await groqRes2.json();
      responseMsg     = groqData2.choices?.[0]?.message;
    }

    const content = responseMsg?.content ?? "Sorry, I couldn't generate a response. Please try again.";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}