// src/app/api/ai/solve-drawing/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { image, userId } = await request.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Fetch student profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, degree_program, current_semester")
      .eq("id", userId)
      .single();

   const systemPrompt = `You are a mathematics and science tutor for university students.

Analyze the drawing or equation in the image and solve it completely.

STRICT FORMAT RULES — YOU MUST FOLLOW THESE:
- Write math in plain text only. Never use LaTeX. Never use dollar signs.
- Write "x = 5" not "$x = 5$"
- Write "x^2 + 3x - 4 = 0" not "$x^{2} + 3x - 4 = 0$"
- Write "sqrt(16) = 4" not "\\sqrt{16} = 4"
- Use plain English explanations between steps
- Number every step clearly

RESPONSE STRUCTURE:
What I see: [describe the problem in one line]

Step 1: [first operation]
Step 2: [next operation]
...

Answer: [final answer in plain text]

Why it works: [one sentence explanation of the method]

Student profile: ${profile?.first_name ?? "student"}, ${profile?.degree_program ?? "university student"}, Semester ${profile?.current_semester ?? 1}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens:  2048,
        temperature: 0.3,  // Lower temp for math accuracy
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type:      "image_url",
                image_url: { url: image },
              },
              {
                type: "text",
                text: "Please analyze this drawing and solve it completely, step by step.",
              },
            ],
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq solve-drawing error:", errText);
      return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const solution = groqData.choices?.[0]?.message?.content ?? "Could not analyze the drawing.";

    return NextResponse.json({ solution });
  } catch (err) {
    console.error("Solve drawing error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}