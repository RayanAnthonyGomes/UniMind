// src/components/courses/DeleteCourseButton.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  courseId:   string;
  courseName: string;
  /** If true, shows only a small icon (for card view). Default: full button with label */
  compact?:   boolean;
  /** Where to redirect after deletion. Default: /courses */
  redirectTo?: string;
}

export default function DeleteCourseButton({
  courseId,
  courseName,
  compact = false,
  redirectTo = "/courses",
}: Props) {
  const router = useRouter();
  const [open,     setOpen]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted,  setMounted]  = useState(false);

  // Portal requires document — only available client-side
  useEffect(() => { setMounted(true); }, []);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`"${courseName}" deleted.`);
      setOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Failed to delete course. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Trigger */}
      {compact ? (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
          title="Delete course"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "28px", height: "28px", borderRadius: "8px",
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.20)",
            color: "#ef4444", cursor: "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.20)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.40)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.10)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.20)";
          }}
        >
          <Trash2 size={13} />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", borderRadius: "10px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.18)",
            color: "#ef4444", fontSize: "0.8125rem", fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.18)";
          }}
        >
          <Trash2 size={14} />
          Delete Course
        </button>
      )}

      {/* Confirmation modal — rendered via portal to escape stacking context */}
      {open && mounted && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "rgba(17,17,24,0.98)",
              border: "1px solid rgba(239,68,68,0.20)",
              borderRadius: "20px",
              padding: "2rem",
              width: "100%", maxWidth: "420px",
              boxShadow: "0 0 60px -10px rgba(239,68,68,0.25), 0 24px 48px rgba(0,0,0,0.5)",
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px -5px rgba(239,68,68,0.3)",
              }}>
                <AlertTriangle size={20} style={{ color: "#ef4444" }} />
              </div>
              <button
                onClick={() => !deleting && setOpen(false)}
                style={{
                  background: "none", border: "none", cursor: deleting ? "not-allowed" : "pointer",
                  color: "var(--color-text-muted)", padding: "0.25rem",
                  opacity: deleting ? 0.4 : 1,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <h2 style={{
              fontSize: "1.125rem", fontWeight: 700,
              color: "var(--color-text-primary)", marginBottom: "0.5rem",
              fontFamily: "var(--font-display)",
            }}>
              Delete "{courseName}"?
            </h2>

            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
              This will permanently delete:
            </p>

            <ul style={{ margin: "0 0 1.5rem", padding: "0 0 0 0", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                "All uploaded files & documents",
                "All AI-generated lectures",
                "All class log entries",
                "All grades for this course",
                "All tasks linked to this course",
              ].map((item) => (
                <li key={item} style={{
                  display: "flex", alignItems: "center", gap: "0.625rem",
                  fontSize: "0.8375rem", color: "var(--color-text-secondary)",
                }}>
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#ef4444", flexShrink: 0,
                  }} />
                  {item}
                </li>
              ))}
            </ul>

            <p style={{
              fontSize: "0.8rem", fontWeight: 600, color: "#ef4444",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: "8px", padding: "0.625rem 0.875rem",
              marginBottom: "1.5rem",
            }}>
              ⚠️ This action cannot be undone.
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => !deleting && setOpen(false)}
                disabled={deleting}
                style={{
                  flex: 1, padding: "0.6875rem",
                  borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.875rem", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: "0.6875rem",
                  borderRadius: "10px", border: "none",
                  background: deleting
                    ? "rgba(239,68,68,0.4)"
                    : "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "white",
                  fontSize: "0.875rem", fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  boxShadow: deleting ? "none" : "0 0 20px -5px rgba(239,68,68,0.5)",
                  transition: "all 0.2s",
                }}
              >
                {deleting
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Deleting...</>
                  : <><Trash2 size={14} /> Yes, Delete</>
                }
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
