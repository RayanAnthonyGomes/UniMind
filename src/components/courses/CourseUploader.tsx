// src/components/courses/CourseUploader.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Upload, FileText, File, BookOpen, Loader2, CheckCircle2 } from "lucide-react";

type DocType = "pdf" | "ppt" | "note" | "obe";

const DOC_TYPES: { value: DocType; label: string; icon: React.ReactNode; accept: string }[] = [
  { value: "pdf",  label: "PDF",          icon: <FileText size={14} />, accept: ".pdf" },
  { value: "ppt",  label: "Slides",       icon: <File size={14} />,     accept: ".ppt,.pptx" },
  { value: "note", label: "Notes",        icon: <FileText size={14} />, accept: ".pdf,.doc,.docx,.txt,.md" },
  { value: "obe",  label: "OBE/Syllabus", icon: <BookOpen size={14} />, accept: ".pdf,.doc,.docx" },
];

interface UploadItem {
  name:     string;
  progress: number;  // 0-100
  done:     boolean;
  error:    boolean;
}

export default function CourseUploader({ courseId, userId }: { courseId: string; userId: string }) {
  const router   = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedType, setSelectedType] = useState<DocType>("pdf");
  const [dragging,     setDragging]     = useState(false);
  const [queue,        setQueue]        = useState<UploadItem[]>([]);
  const [busy,         setBusy]         = useState(false);

  const currentType = DOC_TYPES.find((t) => t.value === selectedType)!;

  function updateItem(index: number, patch: Partial<UploadItem>) {
    setQueue((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  async function uploadFile(file: File, index: number): Promise<boolean> {
    if (file.size > 20 * 1024 * 1024) {
      toast.error(`"${file.name}" is over 20 MB — skipped.`);
      updateItem(index, { progress: 0, error: true });
      return false;
    }

    updateItem(index, { progress: 15 });

    const safeName = file.name
      .replace(/[\[\]\(\)\s]+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "");
    const filePath = `${userId}/${courseId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("unimind-files")
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      updateItem(index, { progress: 0, error: true });
      return false;
    }
    updateItem(index, { progress: 50 });

    const { data: { publicUrl } } = supabase.storage
      .from("unimind-files")
      .getPublicUrl(filePath);

    updateItem(index, { progress: 65 });

    let extractedContent = "";
    try {
      const extractRes = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: publicUrl, type: selectedType }),
      });
      if (extractRes.ok) {
        const data = await extractRes.json();
        extractedContent = data.content ?? "";
      }
    } catch (e) {
      console.error("Text extraction failed:", e);
    }
    updateItem(index, { progress: 85 });

    const { error: dbError } = await supabase.from("documents").insert({
      user_id: userId, course_id: courseId, name: file.name,
      type: selectedType, url: publicUrl, size: file.size,
      content: extractedContent || null,
    });

    if (dbError) {
      toast.error(`Failed to save "${file.name}".`);
      updateItem(index, { progress: 0, error: true });
      return false;
    }

    updateItem(index, { progress: 100, done: true });
    return true;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const initial: UploadItem[] = fileArray.map((f) => ({
      name: f.name, progress: 0, done: false, error: false,
    }));
    setQueue(initial);
    setBusy(true);

    let successCount = 0;
    // Upload sequentially to avoid hammering storage
    for (let i = 0; i < fileArray.length; i++) {
      const ok = await uploadFile(fileArray[i]!, i);
      if (ok) successCount++;
    }

    setBusy(false);

    if (successCount > 0) {
      const plural = successCount > 1;
      toast.success(`${successCount} file${plural ? "s" : ""} uploaded${plural ? "" : " & indexed"}! 📄`);
      router.refresh();
    }

    // Clear queue after a short delay
    setTimeout(() => setQueue([]), 2000);
  }

  const isUploading = busy || queue.some((q) => !q.done && !q.error && q.progress > 0);

  return (
    <div className="glass-card-static" style={{ padding: "1.5rem" }}>
      <h3 style={{
        fontSize: "1rem", fontWeight: 700,
        color: "var(--color-text-primary)", marginBottom: "1rem",
        fontFamily: "var(--font-display)",
      }}>
        Upload Materials
      </h3>

      {/* Type selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {DOC_TYPES.map((t) => (
          <button key={t.value} type="button" onClick={() => setSelectedType(t.value)}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.4rem 0.875rem", borderRadius: "999px",
              fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              background: selectedType === t.value ? "linear-gradient(135deg, #7c3aed, #6366f1)" : "rgba(255,255,255,0.04)",
              color:      selectedType === t.value ? "white" : "var(--color-text-secondary)",
              border:     selectedType === t.value ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow:  selectedType === t.value ? "0 0 15px -3px rgba(124,58,237,0.3)" : "none",
            }}
          >{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !isUploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: "12px", padding: "2rem", textAlign: "center",
          cursor: isUploading ? "not-allowed" : "pointer",
          background: dragging ? "rgba(124,58,237,0.05)" : "rgba(255,255,255,0.02)",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={currentType.accept}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {queue.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", textAlign: "left" }}>
            {queue.map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {item.done
                    ? <CheckCircle2 size={14} style={{ color: "#34d399", flexShrink: 0 }} />
                    : item.error
                      ? <span style={{ fontSize: "0.75rem", color: "#ef4444", flexShrink: 0 }}>✕</span>
                      : <Loader2 size={14} style={{ color: "var(--color-primary-400)", animation: "spin 1s linear infinite", flexShrink: 0 }} />
                  }
                  <span style={{
                    fontSize: "0.8rem", fontWeight: 500,
                    color: item.error ? "#ef4444" : item.done ? "#34d399" : "var(--color-text-primary)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                  }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", flexShrink: 0 }}>
                    {item.done ? "Done" : item.error ? "Failed" : `${item.progress}%`}
                  </span>
                </div>
                {!item.done && !item.error && (
                  <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "999px",
                      background: "linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))",
                      width: `${item.progress}%`, transition: "width 0.3s ease",
                      boxShadow: "0 0 6px rgba(124,58,237,0.4)",
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(124,58,237,0.10)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 0.75rem",
              boxShadow: "0 0 20px -5px rgba(124,58,237,0.2)",
            }}>
              <Upload size={22} style={{ color: "var(--color-primary-300)" }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
              Drop your {currentType.label} here
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              or click to browse · multiple files supported · Max 20MB each
            </p>
          </>
        )}
      </div>
    </div>
  );
}