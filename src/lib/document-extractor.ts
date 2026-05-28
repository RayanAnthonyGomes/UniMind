// src/lib/document-extractor.ts
// Extracts text from PDFs and PPTs stored in Supabase Storage
// Zero native dependencies — pure JavaScript

export async function extractTextFromUrl(
  url:  string,
  type: "pdf" | "ppt" | "note" | "obe"
): Promise<string> {
  try {
    // Fetch the file as a buffer
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    if (type === "pdf" || type === "obe" || type === "note") {
      return await extractPdfText(buffer);
    }

    if (type === "ppt") {
      // PPTs are zip files — extract text from XML inside
      return await extractPptText(buffer);
    }

    return "";
  } catch (err) {
    console.error("Document extraction error:", err);
    return "";
  }
}

// ── PDF text extraction ────────────────────────────────────────────────
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfModule = await import("pdf-parse");
    const pdfParse = (pdfModule as any).default || pdfModule;
    const data     = await pdfParse(buffer);
    return cleanText(data.text);
  } catch (err) {
    console.error("PDF parse error:", err);
    return "";
  }
}

// ── PPT/PPTX text extraction (zip-based XML parsing) ──────────────────
async function extractPptText(buffer: Buffer): Promise<string> {
  try {
    // PPTX files are ZIP archives containing XML
    // We'll use a simple approach: find text between XML tags
    const text = buffer.toString("utf-8", 0, Math.min(buffer.length, 500000));

    // Extract text content from XML tags like <a:t>text</a:t>
    const matches = text.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) ?? [];
    const extracted = matches
      .map((m) => m.replace(/<[^>]+>/g, "").trim())
      .filter((t) => t.length > 1)
      .join(" ");

    return cleanText(extracted);
  } catch (err) {
    console.error("PPT parse error:", err);
    return "";
  }
}

// ── Clean extracted text ───────────────────────────────────────────────
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")      // max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, " ")      // collapse spaces
    .replace(/[^\x20-\x7E\n]/g, " ") // remove non-printable chars
    .trim()
    .slice(0, 15000);                 // max 15k chars to fit context window
}