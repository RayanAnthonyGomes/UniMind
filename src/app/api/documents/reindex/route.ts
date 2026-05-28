// src/app/api/documents/reindex/route.ts
import { NextResponse }       from "next/server";
import { createClient }       from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { extractTextFromUrl } from "@/lib/document-extractor";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { documentId } = await request.json();
    if (!documentId) return NextResponse.json({ error: "Missing documentId" }, { status: 400 });

    // Fetch the document record
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      console.error("Doc fetch error:", docError);
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    console.log("Reindexing:", doc.name, "Type:", doc.type, "URL:", doc.url);

    // Extract storage path from URL
    // URL looks like: https://xxx.supabase.co/storage/v1/object/public/unimind-files/userId/courseId/filename
    let filePath: string | null = null;

    const storageMarker = "/unimind-files/";
    const markerIndex   = doc.url.indexOf(storageMarker);

    if (markerIndex !== -1) {
      filePath = doc.url.slice(markerIndex + storageMarker.length);
    }

    console.log("Storage path:", filePath);

    // Use admin client with service role to bypass RLS on storage
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let fileUrl = doc.url;

    if (filePath) {
      // Try signed URL first (works for private buckets)
      const { data: signedData, error: signedError } = await adminSupabase.storage
        .from("unimind-files")
        .createSignedUrl(filePath, 3600);

      if (signedError) {
        console.error("Signed URL error:", signedError);
      } else if (signedData?.signedUrl) {
        fileUrl = signedData.signedUrl;
        console.log("Using signed URL");
      }
    }

    // Extract text content
    console.log("Extracting from URL:", fileUrl.slice(0, 80) + "...");
    const content = await extractTextFromUrl(fileUrl, doc.type);

    console.log("Extracted content length:", content.length);
    console.log("Preview:", content.slice(0, 200));

    if (!content || content.length < 10) {
      return NextResponse.json({
        error:   "Could not extract text — the PDF may be scanned/image-based",
        success: false,
        length:  content.length,
      });
    }

    // Save extracted content to DB
    const { error: updateError } = await supabase
      .from("documents")
      .update({ content })
      .eq("id", documentId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      length:  content.length,
      preview: content.slice(0, 300),
    });

  } catch (err) {
    console.error("Reindex server error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}