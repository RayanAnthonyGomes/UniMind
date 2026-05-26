// src/app/api/ai/motivation/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      profile, courses, semGpas,
      healthScore, completionRate,
      overdueTasks, mood,
    } = await request.json();

    const moodText =
      mood === 1 ? "very low, struggling and overwhelmed" :
      mood === 2 ? "down and finding things difficult"    :
      mood === 3 ? "okay but could use a boost"           :
      mood === 4 ? "pretty good and motivated"            :
      mood === 5 ? "great and energized"                  :
      "unknown";

    const gpaHistory = semGpas?.length
      ? semGpas.map((s: { semester: number; sgpa: number }) =>
          `Semester ${s.semester}: ${s.sgpa.toFixed(2)}`
        ).join(", ")
      : "No GPA history yet";

    const trend = semGpas?.length >= 2
      ? semGpas[semGpas.length - 1].sgpa > semGpas[semGpas.length - 2].sgpa
        ? "improving"
        : semGpas[semGpas.length - 1].sgpa < semGpas[semGpas.length - 2].sgpa
        ? "declining"
        : "stable"
      : "not enough data";

    const prompt = `You are a caring, wise and genuinely warm mentor writing a personal pep talk for a university student.

STUDENT DATA:
- Name: ${profile.first_name}
- University: ${profile.university_name ?? "their university"}
- Degree: ${profile.degree_program ?? "their degree"}
- Semester: ${profile.current_semester}
- CGPA: ${profile.current_cgpa?.toFixed(2) ?? "not tracked"}
- GPA trend: ${trend}
- GPA history: ${gpaHistory}
- Active courses: ${courses?.map((c: { name: string }) => c.name).join(", ") || "none added yet"}
- Academic health score: ${healthScore}/100
- Task completion rate: ${completionRate}%
- Overdue tasks: ${overdueTasks}
- Current mood: ${moodText}

WRITE a personal, genuine pep talk that:
1. Acknowledges how ${profile.first_name} is actually feeling right now (based on mood and data)
2. References their REAL data — mention their actual CGPA, their actual courses, their trend
3. Identifies something genuinely positive (even if small)
4. Gives 2-3 specific, actionable steps for today — not generic advice
5. Ends with something that feels like a real mentor would say it

TONE RULES:
- Warm and human — not corporate or robotic
- Honest — don't pretend everything is perfect if the data shows struggle
- Encouraging without being fake or over-the-top
- Short paragraphs, easy to read
- NO bullet points — write in flowing paragraphs
- 200-280 words maximum

DO NOT start with "Hey" or "Hello". Start directly with something that hits emotionally.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        max_tokens:  600,
        temperature: 0.85,
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq motivation error:", await groqRes.text());
      return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const message  = groqData.choices?.[0]?.message?.content ?? "Keep going — you're doing better than you think.";

    return NextResponse.json({ message });
  } catch (err) {
    console.error("Motivation API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}