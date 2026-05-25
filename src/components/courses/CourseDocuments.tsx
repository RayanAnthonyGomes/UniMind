// // src/components/courses/CourseDocuments.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";
// import toast from "react-hot-toast";
// import { FileText, File, BookOpen, Trash2, Download, ExternalLink } from "lucide-react";
// import { formatDate } from "@/lib/utils";
// import type { Document } from "@/types";

// const TYPE_CONFIG = {
//   pdf:  { icon: <FileText size={16} />, color: "#ef4444", bg: "#fef2f2", label: "PDF"     },
//   ppt:  { icon: <File     size={16} />, color: "#f97316", bg: "#fff7ed", label: "Slides"  },
//   note: { icon: <FileText size={16} />, color: "#0ea5e9", bg: "#f0f9ff", label: "Note"    },
//   obe:  { icon: <BookOpen size={16} />, color: "#22c55e", bg: "#f0fdf4", label: "Syllabus"},
// };

// function formatBytes(bytes: number) {
//   if (bytes < 1024)        return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// export default function CourseDocuments({
//   documents, courseId, userId,
// }: {
//   documents: Document[];
//   courseId:  string;
//   userId:    string;
// }) {
//   const router   = useRouter();
//   const supabase = createClient();
//   const [deleting, setDeleting] = useState<string | null>(null);

//   async function handleDelete(doc: Document) {
//     if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
//     setDeleting(doc.id);

//     // Extract storage path from URL
//     const urlParts = doc.url.split("/unimind-files/");
//     const path     = urlParts[1];

//     if (path) {
//       await supabase.storage.from("unimind-files").remove([path]);
//     }

//     const { error } = await supabase.from("documents").delete().eq("id", doc.id);

//     if (error) {
//       toast.error("Failed to delete file.");
//     } else {
//       toast.success("File deleted.");
//       router.refresh();
//     }
//     setDeleting(null);
//   }

//   if (documents.length === 0) {
//     return (
//       <div className="clay-card" style={{
//         padding: "2rem", textAlign: "center",
//         border: "1px dashed var(--color-surface-300)",
//         boxShadow: "none",
//       }}>
//         <p style={{ color: "#a8a29e", fontSize: "0.875rem" }}>
//           No files uploaded yet. Upload your first file above.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="clay-card" style={{ padding: "1.5rem" }}>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
//         <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917" }}>
//           Files
//         </h3>
//         <span className="clay-badge" style={{
//           background: "var(--color-surface-100)",
//           border: "1px solid var(--color-surface-200)",
//           color: "#78716c",
//         }}>
//           {documents.length}
//         </span>
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
//         {documents.map((doc) => {
//           const config = TYPE_CONFIG[doc.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.pdf;
//           return (
//             <div
//               key={doc.id}
//               style={{
//                 display: "flex", alignItems: "center", gap: "0.75rem",
//                 padding: "0.75rem", borderRadius: "10px",
//                 background: "var(--color-surface-50)",
//                 border: "1px solid var(--color-surface-200)",
//               }}
//             >
//               {/* Icon */}
//               <div style={{
//                 width: "34px", height: "34px", borderRadius: "8px",
//                 background: config.bg, color: config.color,
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 flexShrink: 0,
//               }}>
//                 {config.icon}
//               </div>

//               {/* Info */}
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <p style={{
//                   fontSize: "0.8375rem", fontWeight: 600, color: "#1c1917",
//                   overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                 }}>
//                   {doc.name}
//                 </p>
//                 <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
//                   {config.label} · {formatBytes(doc.size)} · {formatDate(doc.created_at)}
//                 </p>
//               </div>

//               {/* Actions */}
//               <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                
//                   href={doc.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style={{
//                     padding: "5px", borderRadius: "6px", display: "flex",
//                     background: "var(--color-surface-100)",
//                     border: "1px solid var(--color-surface-200)",
//                     color: "#78716c", textDecoration: "none",
//                   }}
//                   title="Open file"
//                 >
//                   <ExternalLink size={13} />
//                 </a>
//                 <button
//                   onClick={() => handleDelete(doc)}
//                   disabled={deleting === doc.id}
//                   style={{
//                     padding: "5px", borderRadius: "6px", display: "flex",
//                     background: "#fef2f2",
//                     border: "1px solid #fecaca",
//                     color: "var(--color-error)",
//                     cursor: "pointer",
//                   }}
//                   title="Delete file"
//                 >
//                   <Trash2 size={13} />
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
// src/components/courses/CourseDocuments.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { FileText, File, BookOpen, Trash2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Document } from "@/types";

const TYPE_CONFIG = {
  pdf:  { icon: <FileText size={16} />, color: "#ef4444", bg: "#fef2f2", label: "PDF"     },
  ppt:  { icon: <File     size={16} />, color: "#f97316", bg: "#fff7ed", label: "Slides"  },
  note: { icon: <FileText size={16} />, color: "#0ea5e9", bg: "#f0f9ff", label: "Note"    },
  obe:  { icon: <BookOpen size={16} />, color: "#22c55e", bg: "#f0fdf4", label: "Syllabus"},
};

function formatBytes(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CourseDocuments({
  documents, courseId, userId,
}: {
  documents: Document[];
  courseId:  string;
  userId:    string;
}) {
  const router   = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    setDeleting(doc.id);

    // Extract storage path from URL
    const urlParts = doc.url.split("/unimind-files/");
    const path     = urlParts[1];

    if (path) {
      await supabase.storage.from("unimind-files").remove([path]);
    }

    const { error } = await supabase.from("documents").delete().eq("id", doc.id);

    if (error) {
      toast.error("Failed to delete file.");
    } else {
      toast.success("File deleted.");
      router.refresh();
    }
    setDeleting(null);
  }

  if (documents.length === 0) {
    return (
      <div className="clay-card" style={{
        padding: "2rem", textAlign: "center",
        border: "1px dashed var(--color-surface-300)",
        boxShadow: "none",
      }}>
        <p style={{ color: "#a8a29e", fontSize: "0.875rem" }}>
          No files uploaded yet. Upload your first file above.
        </p>
      </div>
    );
  }

  return (
    <div className="clay-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917" }}>
          Files
        </h3>
        <span className="clay-badge" style={{
          background: "var(--color-surface-100)",
          border: "1px solid var(--color-surface-200)",
          color: "#78716c",
        }}>
          {documents.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {documents.map((doc) => {
          const config = TYPE_CONFIG[doc.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.pdf;
          return (
            <div
              key={doc.id}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem", borderRadius: "10px",
                background: "var(--color-surface-50)",
                border: "1px solid var(--color-surface-200)",
              }}
            >
              {/* Icon */}
              <div style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: config.bg, color: config.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {config.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "0.8375rem", fontWeight: 600, color: "#1c1917",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {doc.name}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
                  {config.label} · {formatBytes(doc.size)} · {formatDate(doc.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                {/* WE ADDED THE `<a` RIGHT HERE */}
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "5px", borderRadius: "6px", display: "flex",
                    background: "var(--color-surface-100)",
                    border: "1px solid var(--color-surface-200)",
                    color: "#78716c", textDecoration: "none",
                  }}
                  title="Open file"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => handleDelete(doc)}
                  disabled={deleting === doc.id}
                  style={{
                    padding: "5px", borderRadius: "6px", display: "flex",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "var(--color-error)",
                    cursor: "pointer",
                  }}
                  title="Delete file"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}