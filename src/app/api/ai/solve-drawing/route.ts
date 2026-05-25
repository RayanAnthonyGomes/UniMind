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

    const systemPrompt = `You are a highly skilled mathematics and science tutor for university students.

The student is: ${profile?.first_name ?? "a student"}
Degree: ${profile?.degree_program ?? "not specified"}
Semester: ${profile?.current_semester ?? "unknown"}

TASK: Analyze the drawing/equation in the image and provide a complete, clear solution.

RESPONSE FORMAT — always follow this structure:
1. **What I see**: Briefly describe what's written/drawn
2. **Solution**: Solve it step by step, numbering each step
3. **Answer**: State the final answer clearly
4. **Explanation**: Explain the concept or method used

GUIDELINES:
- Show EVERY step — don't skip anything
- Use simple language for explanations
- If it's a diagram, explain what it represents and any key properties
- If it's a word problem, identify given info and unknowns first
- If handwriting is unclear, state your best interpretation
- Be encouraging — remind them this is a learnable concept`;

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