// src/app/api/ai/generate-lecture/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId, topic } = await request.json();
    if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

    // Fetch course info
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .eq("user_id", user.id)
      .single();

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    // Fetch all indexed documents for this course
    const { data: documents } = await supabase
      .from("documents")
      .select("name, type, content")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .not("content", "is", null);

    // Fetch student profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, degree_program, current_semester")
      .eq("id", user.id)
      .single();

    const hasDocuments = documents && documents.length > 0;

    // Build document context
    const docContext = hasDocuments
      ? documents.map((d) =>
          `--- ${d.name} (${d.type.toUpperCase()}) ---\n${d.content!.slice(0, 4000)}`
        ).join("\n\n")
      : "No documents uploaded yet — generate a general lecture based on the course topic.";

    const topicLine = topic
      ? `Focus specifically on this topic: "${topic}"`
      : `Cover the core fundamentals of this course based on the uploaded materials.`;

    const prompt = `You are an expert university lecturer and educational content writer.

Generate a complete, detailed study lecture for a university student.

STUDENT: ${profile?.first_name}, studying ${profile?.degree_program}, Semester ${profile?.current_semester}
COURSE: ${course.name} (${course.category})
${topicLine}

COURSE MATERIALS PROVIDED:
${docContext}

Generate a lecture in this EXACT JSON format — return ONLY valid JSON, nothing else:

{
  "title": "Clear descriptive lecture title",
  "topic": "The specific topic covered",
  "objectives": [
    "By the end of this lecture, you will understand...",
    "You will be able to...",
    "You will know how to..."
  ],
  "sections": [
    {
      "heading": "Section heading",
      "content": "Full detailed explanation in plain simple English. Write like you are talking to a student directly. Use examples. Explain WHY things work the way they do. Minimum 150 words per section.",
      "key_point": "The single most important thing to remember from this section"
    }
  ],
  "key_terms": [
    {
      "term": "Technical term",
      "definition": "Plain English definition a student can actually remember"
    }
  ],
  "summary": [
    "First key takeaway from this lecture",
    "Second key takeaway",
    "Third key takeaway"
  ],
  "read_time": 7
}

RULES:
- Write EVERYTHING in plain simple English. No jargon without explanation.
- Minimum 4 sections, maximum 8 sections
- Each section minimum 150 words
- read_time is estimated minutes to read (typically 5-12)
- Base content on the provided documents when available
- Make it genuinely educational — a student should be able to study ONLY from this lecture
- Return ONLY the JSON object. No markdown. No backticks. No explanation.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        max_tokens:  4000,
        temperature: 0.4,
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq error:", await groqRes.text());
      return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
    }

    const groqData   = await groqRes.json();
    const rawContent = groqData.choices?.[0]?.message?.content ?? "";

    // Parse JSON from response
    let lecture;
    try {
      // Strip any accidental markdown fences
      const cleaned = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      lecture = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "\nRaw:", rawContent.slice(0, 500));
      return NextResponse.json({ error: "AI returned invalid format. Please try again." }, { status: 500 });
    }

    // Save lecture to database
    const { data: savedLecture, error: saveError } = await supabase
      .from("lectures")
      .insert({
        user_id:    user.id,
        course_id:  courseId,
        title:      lecture.title,
        objectives: lecture.objectives ?? [],
        sections:   lecture.sections   ?? [],
        key_terms:  lecture.key_terms  ?? [],
        summary:    lecture.summary    ?? [],
        read_time:  lecture.read_time  ?? 5,
        topic:      lecture.topic      ?? topic ?? course.name,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      return NextResponse.json({ error: "Failed to save lecture" }, { status: 500 });
    }

    // Auto-create a task for reading this lecture
    await supabase.from("tasks").insert({
      user_id:      user.id,
      course_id:    courseId,
      title:        `📖 Read: ${lecture.title} (~${lecture.read_time} min)`,
      description:  `AI-generated lecture for ${course.name}. Read and review the key concepts.`,
      type:         "homework",
      priority:     "medium",
      status:       "pending",
      ai_generated: true,
    });

    // Create an in-app notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      title:   "New Lecture Generated! 📚",
      body:    `"${lecture.title}" is ready for ${course.name}. A reading task has been added.`,
      type:    "ai_ready",
      link:    `/courses/${courseId}/lectures/${savedLecture.id}`,
    });

    return NextResponse.json({ lecture: savedLecture });

  } catch (err) {
    console.error("Generate lecture error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}