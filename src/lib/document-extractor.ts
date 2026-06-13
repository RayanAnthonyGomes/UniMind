// src/lib/document-extractor.ts

export async function extractTextFromUrl(
  url: string,
  type: string
): Promise<string> {
  try {
    console.log("Fetching file from URL...");
    const response = await fetch(url, {
      headers: { "User-Agent": "UNIMIND/1.0" },
    });

    console.log("Fetch status:", response.status, response.statusText);

    if (!response.ok) {
      const body = await response.text();
      console.error("Fetch failed body:", body.slice(0, 200));
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer size:", buffer.length, "bytes");

    if (buffer.length < 100) {
      console.error("File too small — probably an error response");
      return "";
    }

    // Detect actual file type from magic bytes, not just the `type` label
    const ext = detectExtension(buffer, url);
    console.log("Detected extension:", ext, "| declared type:", type);

    if (ext === "pdf") return await extractPdfText(buffer);
    if (ext === "pptx") return await extractPptxText(buffer);
    if (ext === "docx") return await extractDocxText(buffer);
    if (ext === "txt" || ext === "md") return cleanText(buffer.toString("utf-8"));

    // Fallback: use declared type
    if (type === "pdf" || type === "obe") return await extractPdfText(buffer);
    if (type === "ppt") return await extractPptxText(buffer); // try as PPTX
    if (type === "note") {
      // Try DOCX first, then PDF, then plain text
      const docxText = await extractDocxText(buffer);
      if (docxText.length > 20) return docxText;
      return await extractPdfText(buffer);
    }

    return cleanText(buffer.toString("utf-8"));
  } catch (err) {
    console.error("Extraction error:", err);
    return "";
  }
}

// ─── Magic byte detection ───────────────────────────────────────────────────

function detectExtension(buffer: Buffer, url: string): string {
  // ZIP magic: PK\x03\x04 — covers PPTX, DOCX, XLSX (Office Open XML)
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b &&
                buffer[2] === 0x03 && buffer[3] === 0x04;

  if (isZip) {
    // Peek into the ZIP central directory to determine Office type
    const str = buffer.toString("binary", 0, Math.min(buffer.length, 4000));
    if (str.includes("ppt/")) return "pptx";
    if (str.includes("word/")) return "docx";
    if (str.includes("xl/"))   return "xlsx";
    return "zip";
  }

  // PDF magic: %PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 &&
      buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "pdf";
  }

  // Fall back to URL extension
  const urlLower = url.toLowerCase().split("?")[0] ?? "";
  if (urlLower.endsWith(".pptx")) return "pptx";
  if (urlLower.endsWith(".ppt"))  return "pptx"; // treat old .ppt as PPTX attempt
  if (urlLower.endsWith(".docx")) return "docx";
  if (urlLower.endsWith(".doc"))  return "docx";
  if (urlLower.endsWith(".pdf"))  return "pdf";
  if (urlLower.endsWith(".txt"))  return "txt";
  if (urlLower.endsWith(".md"))   return "md";

  return "unknown";
}

// ─── PDF ────────────────────────────────────────────────────────────────────

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    console.log("Parsing PDF...");
    const { extractText } = await import("unpdf");
    const { text } = await extractText(new Uint8Array(buffer));
    const fullText = text.join("\n");
    console.log("PDF extracted:", fullText.length, "chars");
    return cleanText(fullText);
  } catch (err) {
    console.error("PDF parse error:", err);
    return "";
  }
}

// ─── PPTX ───────────────────────────────────────────────────────────────────

async function extractPptxText(buffer: Buffer): Promise<string> {
  try {
    console.log("Parsing PPTX...");
    const jszipMod = await import("jszip");
    const JSZip = jszipMod.default || jszipMod;
    const zip = await new JSZip().loadAsync(buffer);

    // Collect all slide XML files in order
    const slideFiles = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] ?? "0");
        const nb = parseInt(b.match(/\d+/)?.[0] ?? "0");
        return na - nb;
      });

    console.log("Found slides:", slideFiles.length);

    const slideParts: string[] = [];

    for (const slideFile of slideFiles) {
      const xml = await zip.files[slideFile]!.async("string");
      // Extract all <a:t> text nodes
      const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
      const slideText = matches
        .map((m) => m.replace(/<[^>]+>/g, "").trim())
        .filter((t) => t.length > 0)
        .join(" ");
      if (slideText) slideParts.push(slideText);
    }

    // Also try notes slides for extra context
    const notesFiles = Object.keys(zip.files)
      .filter((name) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(name));

    for (const noteFile of notesFiles) {
      const xml = await zip.files[noteFile]!.async("string");
      const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
      const noteText = matches
        .map((m) => m.replace(/<[^>]+>/g, "").trim())
        .filter((t) => t.length > 0)
        .join(" ");
      if (noteText) slideParts.push(`[Notes] ${noteText}`);
    }

    const fullText = slideParts.join("\n");
    console.log("PPTX extracted:", fullText.length, "chars across", slideFiles.length, "slides");
    return cleanText(fullText);
  } catch (err) {
    console.error("PPTX parse error:", err);
    return "";
  }
}

// ─── DOCX ───────────────────────────────────────────────────────────────────

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    console.log("Parsing DOCX with mammoth...");
    const mammothMod = await import("mammoth");
    const mammoth = mammothMod.default || mammothMod;
    const result = await mammoth.extractRawText({ buffer });
    console.log("DOCX extracted:", result.value.length, "chars");
    if (result.messages.length > 0) {
      console.warn("Mammoth messages:", result.messages.slice(0, 3));
    }
    return cleanText(result.value);
  } catch (err) {
    console.error("DOCX parse error:", err);
    return "";
  }
}

// ─── Shared cleanup ─────────────────────────────────────────────────────────

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .trim()
    .slice(0, 15000);
}