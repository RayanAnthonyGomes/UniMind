// src/components/courses/CourseUploader.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Upload, FileText, File, BookOpen, Loader2 } from "lucide-react";

type DocType = "pdf" | "ppt" | "note" | "obe";

const DOC_TYPES: { value: DocType; label: string; icon: React.ReactNode; accept: string }[] = [
  { value: "pdf",  label: "PDF",        icon: <FileText size={14} />, accept: ".pdf" },
  { value: "ppt",  label: "Slides",     icon: <File size={14} />,     accept: ".ppt,.pptx" },
  { value: "note", label: "Notes",      icon: <FileText size={14} />, accept: ".pdf,.doc,.docx,.txt,.md" },
  { value: "obe",  label: "OBE/Syllabus", icon: <BookOpen size={14} />, accept: ".pdf,.doc,.docx" },
];

export default function CourseUploader({
  courseId, userId,
}: {
  courseId: string;
  userId:   string;
}) {
  const router   = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedType, setSelectedType] = useState<DocType>("pdf");
  const [dragging,     setDragging]     = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);

  const currentType = DOC_TYPES.find((t) => t.value === selectedType)!;

 // src/components/courses/CourseUploader.tsx
// Replace the entire uploadFile function:

async function uploadFile(file: File) {
  if (!file) return;

  if (file.size > 20 * 1024 * 1024) {
    toast.error("File too large. Maximum size is 20MB.");
    return;
  }

  setUploading(true);
  setProgress(20);

  const filePath = `${userId}/${courseId}/${Date.now()}-${file.name}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("unimind-files")
    .upload(filePath, file, { upsert: false });

  if (uploadError) {
    toast.error(`Upload failed: ${uploadError.message}`);
    setUploading(false);
    setProgress(0);
    return;
  }

  setProgress(50);

  // Get URL — use getPublicUrl for public bucket
  // or createSignedUrl for private bucket
  const { data: { publicUrl } } = supabase.storage
    .from("unimind-files")
    .getPublicUrl(filePath);

  setProgress(65);

  // Extract text server-side
  let extractedContent = "";
  try {
    const extractRes = await fetch("/api/documents/extract", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: publicUrl, type: selectedType }),
    });
    if (extractRes.ok) {
      const extractData  = await extractRes.json();
      extractedContent   = extractData.content ?? "";
    }
  } catch (e) {
    console.error("Text extraction failed:", e);
    // Continue without text — not a fatal error
  }

  setProgress(80);

  // Save document record with extracted content
  const { error: dbError } = await supabase.from("documents").insert({
    user_id:   userId,
    course_id: courseId,
    name:      file.name,
    type:      selectedType,
    url:       publicUrl,
    size:      file.size,
    content:   extractedContent || null,
  });

  if (dbError) {
    toast.error("Failed to save file info.");
    setUploading(false);
    setProgress(0);
    return;
  }

  setProgress(100);

  const msg = extractedContent
    ? `"${file.name}" uploaded & indexed! AI can now read it. 📄`
    : `"${file.name}" uploaded! 📄`;
  toast.success(msg);

  setTimeout(() => {
    setUploading(false);
    setProgress(0);
    router.refresh();
  }, 500);
}

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]!);
  }

  return (
    <div className="clay-card" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917", marginBottom: "1rem" }}>
        Upload Materials
      </h3>

      {/* Type selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {DOC_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setSelectedType(t.value)}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.4rem 0.875rem", borderRadius: "999px",
              fontSize: "0.8125rem", fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s",
              background: selectedType === t.value ? "var(--color-primary-600)" : "var(--color-surface-100)",
              color:      selectedType === t.value ? "white"                    : "#57534e",
              border:     selectedType === t.value ? "none" : "1px solid var(--color-surface-200)",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--color-primary-400)" : "var(--color-surface-300)"}`,
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragging ? "var(--color-primary-50)" : "var(--color-surface-50)",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={currentType.accept}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <Loader2 size={28} style={{ color: "var(--color-primary-500)", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-primary-600)" }}>
              Uploading...
            </p>
            {/* Progress bar */}
            <div style={{ width: "100%", height: "6px", background: "var(--color-surface-200)", borderRadius: "999px" }}>
              <div style={{
                height: "100%", borderRadius: "999px",
                background: "var(--color-primary-500)",
                width: `${progress}%`, transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        ) : (
          <>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "var(--color-primary-50)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 0.75rem",
            }}>
              <Upload size={22} style={{ color: "var(--color-primary-500)" }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1c1917", marginBottom: "0.25rem" }}>
              Drop your {currentType.label} here
            </p>
            <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
              or click to browse · Max 20MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}