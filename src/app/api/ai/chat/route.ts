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

//     const systemPrompt = `You are UNIMIND AI, a smart, warm and encouraging academic assistant for university students.

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

    let courseContext    = "";
    let documentContext  = "";

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

      if (course) {
        courseContext = `
COURSE: ${course.name} | ${course.category} | ${course.credits} credits | Semester ${course.semester}`;
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
    } else {
      // Global context — fetch all courses
      const { data: courses } = await supabase
        .from("courses")
        .select("name, category, credits")
        .eq("user_id", userId)
        .eq("is_active", true);

      courseContext = `
ACTIVE COURSES:
${courses?.map((c) => `- ${c.name} (${c.category}, ${c.credits} credits)`).join("\n") ?? "None added yet"}`;
    }

    const systemPrompt = `You are UNIMIND AI — a smart, warm academic assistant for university students.

STUDENT: ${profile?.first_name ?? "Student"} | ${profile?.university_name ?? "University"} | ${profile?.degree_program ?? "Degree"} | Semester ${profile?.current_semester ?? 1} | CGPA: ${profile?.current_cgpa?.toFixed(2) ?? "Not set"}

${courseContext}
${documentContext}

PENDING TASKS:
${tasks?.map((t) => `- [${t.type}] ${t.title}${t.due_date ? ` | Due: ${new Date(t.due_date).toLocaleDateString()}` : ""} | ${t.priority} priority`).join("\n") ?? "None"}

RESPONSE RULES — MUST FOLLOW:
- Write in plain, clear English. No LaTeX. No dollar signs around math.
- For math: write "x = 5" not "$x = 5$". Write "x^2" not "$x^{2}$".
- Use **bold** for key terms. Use numbered lists for steps.
- Be concise and warm. Use the student's name occasionally.
- If document content is provided above, reference it directly in your answers.
- For questions about uploaded materials, quote or summarize from the actual content.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
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
          ...messages.slice(-20).map((m: { role: string; content: string }) => ({
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