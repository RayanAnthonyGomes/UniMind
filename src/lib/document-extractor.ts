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

    const contentType = response.headers.get("content-type") ?? "";
    console.log("Content-Type:", contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer size:", buffer.length, "bytes");

    if (buffer.length < 100) {
      console.error("File too small — probably an error response");
      return "";
    }

    if (type === "pdf" || type === "obe" || type === "note") {
      return await extractPdfText(buffer);
    }

    if (type === "ppt") {
      return extractPptText(buffer);
    }

    return cleanText(buffer.toString("utf-8"));
  } catch (err) {
    console.error("Extraction error:", err);
    return "";
  }
}

// async function extractPdfText(buffer: Buffer): Promise<string> {
//   try {
//     console.log("Parsing PDF...");
//     console.log("Buffer starts with:", buffer.slice(0, 5).toString());

//     // Try the non-legacy build first
//     const pdfjsLib = await import("pdfjs-dist");
//     console.log("pdfjs loaded, keys:", Object.keys(pdfjsLib).slice(0, 10));

//     pdfjsLib.GlobalWorkerOptions.workerSrc = "";

//     const loadingTask = pdfjsLib.getDocument({
//       data: new Uint8Array(buffer),
//       useWorkerFetch: false,
//       useSystemFonts: true,
//     });

//     const pdfDocument = await loadingTask.promise;
//     console.log("PDF pages:", pdfDocument.numPages);

//     const textParts: string[] = [];
//     for (let i = 1; i <= pdfDocument.numPages; i++) {
//       const page = await pdfDocument.getPage(i);
//       const textContent = await page.getTextContent();
//       const pageText = textContent.items
//         .map((item: any) => ("str" in item ? item.str : ""))
//         .join(" ");
//       textParts.push(pageText);
//     }

//     const fullText = textParts.join("\n");
//     console.log("Extracted text length:", fullText.length);
//     console.log("Preview:", fullText.slice(0, 200));
//     return cleanText(fullText);
//   } catch (err) {
//     console.error("PDF parse error:", err);
//     return "";
//   }
// }
// async function extractPdfText(buffer: Buffer): Promise<string> {
//   try {
//     console.log("Parsing PDF...");
//     console.log("Buffer starts with:", buffer.slice(0, 5).toString());

//     // Try the non-legacy build first
//     const pdfjsLib = await import("pdfjs-dist");
//     console.log("pdfjs loaded, keys:", Object.keys(pdfjsLib).slice(0, 10));

//     pdfjsLib.GlobalWorkerOptions.workerSrc = "";

//     const loadingTask = pdfjsLib.getDocument({
//       data: new Uint8Array(buffer),
//       useWorkerFetch: false,
//       useSystemFonts: true,
//     });

//     const pdfDocument = await loadingTask.promise;
//     console.log("PDF pages:", pdfDocument.numPages);

//     const textParts: string[] = [];
//     for (let i = 1; i <= pdfDocument.numPages; i++) {
//       const page = await pdfDocument.getPage(i);
//       const textContent = await page.getTextContent();
//       const pageText = textContent.items
//         .map((item: any) => ("str" in item ? item.str : ""))
//         .join(" ");
//       textParts.push(pageText);
//     }

//     const fullText = textParts.join("\n");
//     console.log("Extracted text length:", fullText.length);
//     console.log("Preview:", fullText.slice(0, 200));
//     return cleanText(fullText);
//   } catch (err) {
//     console.error("PDF parse error:", err);
//     return "";
//   }
// }
// async function extractPdfText(buffer: Buffer): Promise<string> {
//   try {
//     console.log("Parsing PDF...");

//     // Polyfill DOMMatrix for Node.js before importing pdfjs
//     if (typeof globalThis.DOMMatrix === "undefined") {
//       const { DOMMatrix } = await import("@napi-rs/canvas");
//       (globalThis as any).DOMMatrix = DOMMatrix;
//     }

//     const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
//     pdfjsLib.GlobalWorkerOptions.workerSrc = "";

//     const loadingTask = pdfjsLib.getDocument({
//       data: new Uint8Array(buffer),
//       useWorkerFetch: false,
//       useSystemFonts: true,
//     });

//     const pdfDocument = await loadingTask.promise;
//     console.log("PDF pages:", pdfDocument.numPages);

//     const textParts: string[] = [];
//     for (let i = 1; i <= pdfDocument.numPages; i++) {
//       const page = await pdfDocument.getPage(i);
//       const textContent = await page.getTextContent();
//       const pageText = textContent.items
//         .map((item: any) => ("str" in item ? item.str : ""))
//         .join(" ");
//       textParts.push(pageText);
//     }

//     const fullText = textParts.join("\n");
//     console.log("Extracted text length:", fullText.length);
//     return cleanText(fullText);
//   } catch (err) {
//     console.error("PDF parse error:", err);
//     return "";
//   }
// }
// async function extractPdfText(buffer: Buffer): Promise<string> {
//   try {
//     console.log("Parsing PDF...");

//     // Minimal DOMMatrix polyfill for Node.js (pdfjs needs it at module load)
//     if (typeof globalThis.DOMMatrix === "undefined") {
//       (globalThis as any).DOMMatrix = class DOMMatrix {
//         a=1; b=0; c=0; d=1; e=0; f=0;
//         m11=1; m12=0; m13=0; m14=0;
//         m21=0; m22=1; m23=0; m24=0;
//         m31=0; m32=0; m33=1; m34=0;
//         m41=0; m42=0; m43=0; m44=1;
//         constructor(init?: any) {}
//         multiply(m: any) { return new (globalThis as any).DOMMatrix(); }
//         inverse()        { return new (globalThis as any).DOMMatrix(); }
//         translate(x=0,y=0,z=0) { return new (globalThis as any).DOMMatrix(); }
//         scale(x=1,y=1,z=1)     { return new (globalThis as any).DOMMatrix(); }
//         rotate(r=0)             { return new (globalThis as any).DOMMatrix(); }
//         transformPoint(p: any)  { return p; }
//       };
//     }

//     const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
//     pdfjsLib.GlobalWorkerOptions.workerSrc = "";

//     const loadingTask = pdfjsLib.getDocument({
//       data: new Uint8Array(buffer),
//       useWorkerFetch: false,
//       useSystemFonts: true,
//     });

//     const pdfDocument = await loadingTask.promise;
//     console.log("PDF pages:", pdfDocument.numPages);

//     const textParts: string[] = [];
//     for (let i = 1; i <= pdfDocument.numPages; i++) {
//       const page = await pdfDocument.getPage(i);
//       const textContent = await page.getTextContent();
//       const pageText = textContent.items
//         .map((item: any) => ("str" in item ? item.str : ""))
//         .join(" ");
//       textParts.push(pageText);
//     }

//     const fullText = textParts.join("\n");
//     console.log("Extracted text length:", fullText.length);
//     return cleanText(fullText);
//   } catch (err) {
//     console.error("PDF parse error:", err);
//     return "";
//   }
// }
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    console.log("Parsing PDF...");

    const { extractText } = await import("unpdf");

const { text } = await extractText(new Uint8Array(buffer));
const fullText = text.join("\n");

console.log("Extracted text length:", fullText.length);
return cleanText(fullText);
  } catch (err) {
    console.error("PDF parse error:", err);
    return "";
  }
}
function extractPptText(buffer: Buffer): string {
  try {
    const raw = buffer.toString("utf-8", 0, Math.min(buffer.length, 500000));
    const matches = raw.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) ?? [];
    const text = matches
      .map((m) => m.replace(/<[^>]+>/g, "").trim())
      .filter((t) => t.length > 1)
      .join(" ");
    console.log("PPT extracted text length:", text.length);
    return cleanText(text);
  } catch (err) {
    console.error("PPT parse error:", err);
    return "";
  }
}

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