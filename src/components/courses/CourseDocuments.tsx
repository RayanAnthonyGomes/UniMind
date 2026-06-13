// src/components/courses/CourseDocuments.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  FileText, File, BookOpen, Trash2,
  ExternalLink, Loader2, RefreshCw, CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Document } from "@/types";

const TYPE_CONFIG = {
  pdf:  { icon: <FileText size={16} />, color: "#f87171", bg: "rgba(248,113,113,0.10)", label: "PDF"      },
  ppt:  { icon: <File     size={16} />, color: "#fb923c", bg: "rgba(251,146,60,0.10)",  label: "Slides"   },
  note: { icon: <FileText size={16} />, color: "#38bdf8", bg: "rgba(56,189,248,0.10)",  label: "Note"     },
  obe:  { icon: <BookOpen size={16} />, color: "#34d399", bg: "rgba(52,211,153,0.10)",  label: "Syllabus" },
};

function formatBytes(bytes: number) {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Open file with signed URL
function OpenFileButton({ doc }: { doc: Document }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function openFile() {
    setLoading(true);
    try {
      const urlParts = doc.url.split("/unimind-files/");
      const path     = urlParts[1];
      if (!path) { window.open(doc.url, "_blank"); return; }

      const { data, error } = await supabase.storage
        .from("unimind-files")
        .createSignedUrl(path, 3600);

      if (error || !data?.signedUrl) { toast.error("Could not open file. Try re-uploading."); return; }
      window.open(data.signedUrl, "_blank");
    } catch { toast.error("Failed to open file."); }
    finally { setLoading(false); }
  }

  return (
    <button onClick={openFile} disabled={loading}
      style={{
        padding: "5px", borderRadius: "6px", display: "flex",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        color: "var(--color-text-muted)",
        cursor: loading ? "wait" : "pointer", transition: "all 0.15s",
      }}
      title="Open file"
    >
      {loading
        ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
        : <ExternalLink size={13} />
      }
    </button>
  );
}

// ── Re-index button
function ReindexButton({ doc, onDone }: { doc: Document; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [indexed, setIndexed] = useState(!!(doc as any).content);

  async function reindex() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents/reindex", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Indexed! AI can now read this file. ✅"); setIndexed(true); onDone(); }
      else { toast.error("Could not extract text from this file."); }
    } catch { toast.error("Indexing failed."); }
    finally { setLoading(false); }
  }

  if (indexed) {
    return (
      <div style={{
        padding: "5px", borderRadius: "6px", display: "flex",
        background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.15)",
        color: "var(--color-success)",
      }} title="AI can read this file">
        <CheckCircle2 size={13} />
      </div>
    );
  }

  return (
    <button onClick={reindex} disabled={loading}
      style={{
        padding: "5px", borderRadius: "6px", display: "flex",
        background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.15)",
        color: "var(--color-primary-300)",
        cursor: loading ? "wait" : "pointer", transition: "all 0.15s",
      }}
      title="Let AI read this file"
    >
      {loading
        ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
        : <RefreshCw size={13} />
      }
    </button>
  );
}

// ── Main component
export default function CourseDocuments({
  documents, courseId, userId,
}: { documents: Document[]; courseId: string; userId: string; }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    setDeleting(doc.id);
    const urlParts = doc.url.split("/unimind-files/");
    const path = urlParts[1];
    if (path) await supabase.storage.from("unimind-files").remove([path]);
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) toast.error("Failed to delete file.");
    else { toast.success("File deleted."); router.refresh(); }
    setDeleting(null);
  }

  if (documents.length === 0) {
    return (
      <div className="glass-card-static" style={{
        padding: "2rem", textAlign: "center",
        border: "1px dashed rgba(255,255,255,0.08)", boxShadow: "none",
      }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>No files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card-static" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>Files</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>✅ = AI can read · 🔄 = click to index</span>
          <span className="clay-badge">{documents.length}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {documents.map((doc) => {
          const config = TYPE_CONFIG[doc.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.pdf;
          return (
            <div key={doc.id} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem", borderRadius: "10px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
              transition: "all 0.15s",
            }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: config.bg, color: config.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{config.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.8375rem", fontWeight: 600, color: "var(--color-text-primary)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {config.label} · {formatBytes(doc.size)} · {formatDate(doc.created_at)}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                <ReindexButton doc={doc} onDone={() => router.refresh()} />
                <OpenFileButton doc={doc} />
                <button onClick={() => handleDelete(doc)} disabled={deleting === doc.id}
                  style={{
                    padding: "5px", borderRadius: "6px", display: "flex",
                    background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)",
                    color: "var(--color-error)", cursor: "pointer", transition: "all 0.15s",
                  }} title="Delete file">
                  {deleting === doc.id
                    ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                    : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}