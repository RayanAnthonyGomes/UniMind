// // src/app/api/documents/extract/route.ts
// import { NextResponse }       from "next/server";
// import { createClient }       from "@/lib/supabase/server";
// import { extractTextFromUrl } from "@/lib/document-extractor";

// export async function POST(request: Request) {
//   try {
//     const supabase = await createClient();
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { url, type } = await request.json();
//     if (!url || !type)  return NextResponse.json({ error: "Missing fields" }, { status: 400 });

//     const content = await extractTextFromUrl(url, type);

//     return NextResponse.json({ content, success: content.length > 0 });
//   } catch (err) {
//     console.error("Extract route error:", err);
//     return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
//   }
// }
// src/app/api/documents/extract/route.ts
import { NextResponse }       from "next/server";
import { createClient }       from "@/lib/supabase/server";
import { extractTextFromUrl } from "@/lib/document-extractor";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url, type } = await request.json();
    if (!url || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    console.log("Extracting:", type, url.slice(0, 80));

    const content = await extractTextFromUrl(url, type);

    console.log("Extracted length:", content.length);

    return NextResponse.json({
      content,
      success: content.length > 0,
      length:  content.length,
    });

  } catch (err) {
    console.error("Extract route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}