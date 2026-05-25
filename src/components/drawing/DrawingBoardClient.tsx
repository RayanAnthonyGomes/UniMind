// src/components/drawing/DrawingBoardClient.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pen, Eraser, Trash2, Download, Send,
  Loader2, Sparkles, Save, RotateCcw,
  ChevronRight, Clock, BookOpen, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────
interface Course  { id: string; name: string; color: string; }
interface Session {
  id:          string;
  title:       string;
  ai_solution: string | null;
  updated_at:  string;
  course_id:   string | null;
}

type Tool   = "pen" | "eraser";

const COLORS = [
  "#1c1917", // near-black (default)
  "#6366f1", // indigo
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#0ea5e9", // sky
  "#a855f7", // purple
  "#ffffff", // white
];

const STROKE_SIZES = [2, 4, 7, 12, 20];

// ── Format AI solution ─────────────────────────────────────────────────
function FormatSolution({ text }: { text: string }) {
  const lines   = text.split("\n");
  const result: React.ReactNode[] = [];
  let   listBuf: string[]         = [];
  let   stepNum = 0;

  function flushList() {
    if (!listBuf.length) return;
    result.push(
      <ul key={`ul-${result.length}`} style={{
        paddingLeft: "1.25rem", margin: "0.5rem 0",
        display: "flex", flexDirection: "column", gap: "0.375rem",
      }}>
        {listBuf.map((item, i) => (
          <li key={i} style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "#1c1917" }}>
            {item.replace(/^[-*•]\s*/, "")}
          </li>
        ))}
      </ul>
    );
    listBuf = [];
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Numbered steps like "1." or "Step 1:"
    if (/^(step\s*)?\d+[.:]\s/i.test(trimmed)) {
      flushList();
      stepNum++;
      const content = trimmed.replace(/^(step\s*)?\d+[.:]\s*/i, "");
      result.push(
        <div key={i} style={{
          display: "flex", gap: "0.75rem", alignItems: "flex-start",
          padding: "0.625rem 0.875rem",
          background: stepNum % 2 === 0 ? "var(--color-surface-50)" : "white",
          borderRadius: "8px",
          border: "1px solid var(--color-surface-100)",
          marginBottom: "0.375rem",
        }}>
          <span style={{
            minWidth: "24px", height: "24px", borderRadius: "50%",
            background: "var(--color-primary-100)",
            color: "var(--color-primary-700)",
            fontSize: "0.75rem", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {stepNum}
          </span>
          <span style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "#1c1917" }}>
            {content}
          </span>
        </div>
      );
    } else if (/^#{1,3}\s/.test(trimmed)) {
      flushList();
      const txt = trimmed.replace(/^#+\s/, "");
      result.push(
        <p key={i} style={{
          fontWeight: 700, fontSize: "0.9375rem", color: "#1c1917",
          marginTop: "1rem", marginBottom: "0.375rem",
          paddingBottom: "0.375rem",
          borderBottom: "2px solid var(--color-primary-100)",
        }}>
          {txt}
        </p>
      );
    } else if (/^[-*•]\s/.test(trimmed)) {
      listBuf.push(trimmed);
    } else if (trimmed === "") {
      flushList();
      result.push(<div key={i} style={{ height: "0.5rem" }} />);
    } else {
      flushList();
      // Inline math-like highlighting: wrap = signs and operators
      const parts = trimmed.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      result.push(
        <p key={i} style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#1c1917", margin: "0.125rem 0" }}>
          {parts.map((part, j) => {
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code key={j} style={{
                  background: "var(--color-primary-50)",
                  color: "var(--color-primary-700)",
                  borderRadius: "4px", padding: "1px 6px",
                  fontFamily: "monospace", fontSize: "0.875rem",
                  fontWeight: 600,
                }}>
                  {part.slice(1, -1)}
                </code>
              );
            }
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={j} style={{ color: "#1c1917" }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    }
  });

  flushList();
  return <>{result}</>;
}

// ── Main component ─────────────────────────────────────────────────────
export default function DrawingBoardClient({
  userId, courses, recentSessions,
}: {
  userId:          string;
  courses:         Course[];
  recentSessions:  Session[];
}) {
  const supabase   = createClient();
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const ctxRef     = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef<{ x: number; y: number } | null>(null);

  const [tool,       setTool]       = useState<Tool>("pen");
  const [color,      setColor]      = useState(COLORS[0]!);
  const [strokeSize, setStrokeSize] = useState(4);
  const [solving,    setSolving]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [solution,   setSolution]   = useState<string | null>(null);
  const [sessionId,  setSessionId]  = useState<string | null>(null);
  const [title,      setTitle]      = useState("Untitled Session");
  const [courseId,   setCourseId]   = useState<string>("");
  const [hasDrawing, setHasDrawing] = useState(false);
  const [sessions,   setSessions]   = useState<Session[]>(recentSessions);
  const [showHist,   setShowHist]   = useState(false);

  // ── Setup canvas ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle   = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctxRef.current  = ctx;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Update ctx settings when tool/color/size changes ──────
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth   = tool === "eraser" ? strokeSize * 4 : strokeSize;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
  }, [tool, color, strokeSize]);

  // ── Pointer helpers ────────────────────────────────────────
  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0]!;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left,
             y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    lastPos.current   = pos;

    const ctx = ctxRef.current!;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.fill();
    setHasDrawing(true);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing.current || !lastPos.current) return;

    const ctx = ctxRef.current!;
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasDrawing(true);
  }

  function stopDraw() {
    isDrawing.current = false;
    lastPos.current   = null;
    ctxRef.current?.beginPath();
  }

  // ── Clear canvas ───────────────────────────────────────────
  function clearCanvas() {
    const canvas = canvasRef.current!;
    const ctx    = ctxRef.current!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    setSolution(null);
  }

  // ── Download canvas ────────────────────────────────────────
  function downloadCanvas() {
    const canvas = canvasRef.current!;
    const link   = document.createElement("a");
    link.download = `${title}.png`;
    link.href     = canvas.toDataURL("image/png");
    link.click();
  }

  // ── Solve with AI ──────────────────────────────────────────
  async function solveWithAI() {
    if (!hasDrawing) { toast.error("Draw something first!"); return; }
    setSolving(true);
    setSolution(null);

    const canvas  = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/png");

    try {
      const res = await fetch("/api/ai/solve-drawing", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ image: dataUrl, userId }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setSolution(data.solution ?? "Could not analyze the drawing.");
    } catch {
      toast.error("AI solving failed. Please try again.");
    } finally {
      setSolving(false);
    }
  }

  // ── Save session ───────────────────────────────────────────
  async function saveSession() {
    if (!hasDrawing && !solution) { toast.error("Nothing to save yet."); return; }
    setSaving(true);

    const canvas    = canvasRef.current!;
    const imageData = canvas.toDataURL("image/png");

    const payload = {
      user_id:     userId,
      title,
      canvas_data: imageData,
      ai_solution: solution,
      course_id:   courseId || null,
    };

    let error;
    let data: Session | null = null;

    if (sessionId) {
      const res = await supabase
        .from("drawing_sessions")
        .update(payload)
        .eq("id", sessionId)
        .select()
        .single();
      error = res.error;
      data  = res.data as Session;
    } else {
      const res = await supabase
        .from("drawing_sessions")
        .insert(payload)
        .select()
        .single();
      error = res.error;
      data  = res.data as Session;
    }

    if (error) {
      toast.error("Failed to save session.");
    } else {
      toast.success("Session saved! 💾");
      if (data) {
        setSessionId(data.id);
        setSessions((prev) => {
          const filtered = prev.filter((s) => s.id !== data!.id);
          return [data!, ...filtered].slice(0, 10);
        });
      }
    }
    setSaving(false);
  }

  // ── Load session ───────────────────────────────────────────
  function loadSession(session: Session) {
    setSessionId(session.id);
    setTitle(session.title);
    setSolution(session.ai_solution);
    setCourseId(session.course_id ?? "");
    setShowHist(false);

    // Draw canvas_data onto canvas
    const canvas = canvasRef.current!;
    const ctx    = ctxRef.current!;
    const img    = new window.Image();

    supabase
      .from("drawing_sessions")
      .select("canvas_data")
      .eq("id", session.id)
      .single()
      .then(({ data }) => {
        if (!data?.canvas_data) return;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHasDrawing(true);
        };
        img.src = data.canvas_data;
      });
  }

  // ── New session ────────────────────────────────────────────
  function newSession() {
    clearCanvas();
    setSessionId(null);
    setTitle("Untitled Session");
    setSolution(null);
    setCourseId("");
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "calc(100vh - 64px - 3rem)" }}>

      {/* ── TOP BAR ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1c1917" }}>
            ✏️ Drawing Board
          </h1>
          <p style={{ fontSize: "0.8375rem", color: "#78716c" }}>
            Draw equations, diagrams or problems — let AI solve them
          </p>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
          {/* Session title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="clay-input"
            style={{ width: "180px", fontSize: "0.875rem" }}
            placeholder="Session title..."
          />

          {/* Link to course */}
          <select
            className="clay-input"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            style={{ width: "auto", cursor: "pointer", fontSize: "0.875rem" }}
          >
            <option value="">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* History */}
          <button
            onClick={() => setShowHist(!showHist)}
            className="btn-secondary"
            style={{ position: "relative" }}
          >
            <Clock size={15} />
            History
            {sessions.length > 0 && (
              <span style={{
                position: "absolute", top: "-6px", right: "-6px",
                width: "18px", height: "18px", borderRadius: "50%",
                background: "var(--color-primary-600)", color: "white",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {sessions.length}
              </span>
            )}
          </button>

          {/* New session */}
          <button onClick={newSession} className="btn-secondary">
            <RotateCcw size={15} /> New
          </button>

          {/* Save */}
          <button onClick={saveSession} className="btn-secondary" disabled={saving}>
            {saving
              ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              : <Save size={15} />
            }
            Save
          </button>

          {/* Download */}
          <button onClick={downloadCanvas} className="btn-secondary">
            <Download size={15} /> Export
          </button>

          {/* Solve */}
          <button
            onClick={solveWithAI}
            className="btn-primary"
            disabled={solving || !hasDrawing}
            style={{ minWidth: "130px" }}
          >
            {solving
              ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Solving...</>
              : <><Sparkles size={15} /> Solve with AI</>
            }
          </button>
        </div>
      </div>

      {/* ── HISTORY DROPDOWN ─────────────────────────────── */}
      {showHist && sessions.length > 0 && (
        <div className="clay-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#1c1917" }}>
              Recent Sessions
            </h3>
            <button onClick={() => setShowHist(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e" }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSession(s)}
                style={{
                  padding: "0.625rem 1rem", borderRadius: "10px",
                  background: sessionId === s.id ? "var(--color-primary-50)" : "var(--color-surface-50)",
                  border: `1px solid ${sessionId === s.id ? "var(--color-primary-200)" : "var(--color-surface-200)"}`,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <p style={{ fontSize: "0.8375rem", fontWeight: 600, color: "#1c1917", marginBottom: "0.125rem" }}>
                  {s.title}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
                  {new Date(s.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {s.ai_solution ? " · Solved" : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN AREA ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr auto", gap: "1.25rem", minHeight: 0 }}>

        {/* ── CANVAS SIDE ─────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: 0 }}>

          {/* Toolbar */}
          <div className="clay-card" style={{
            padding: "0.75rem 1.25rem",
            display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap",
          }}>

            {/* Tool toggle */}
            <div style={{
              display: "flex", borderRadius: "10px",
              background: "var(--color-surface-100)",
              border: "1px solid var(--color-surface-200)",
              overflow: "hidden",
            }}>
              {([
                { value: "pen",    icon: <Pen    size={16} />, label: "Pen"    },
                { value: "eraser", icon: <Eraser size={16} />, label: "Eraser" },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTool(t.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.5rem 0.875rem", border: "none", cursor: "pointer",
                    background:  tool === t.value ? "var(--color-primary-600)" : "transparent",
                    color:       tool === t.value ? "white" : "#57534e",
                    fontWeight:  500, fontSize: "0.8125rem",
                    transition:  "all 0.15s",
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Color picker */}
            <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setTool("pen"); }}
                  style={{
                    width:  color === c && tool === "pen" ? "28px" : "22px",
                    height: color === c && tool === "pen" ? "28px" : "22px",
                    borderRadius:  "50%",
                    background:    c,
                    border:        `2px solid ${color === c && tool === "pen" ? "var(--color-primary-500)" : "var(--color-surface-300)"}`,
                    cursor:  "pointer",
                    transition:    "all 0.15s",
                    boxShadow:     c === "#ffffff" ? "inset 0 0 0 1px #e2dbd2" : "none",
                  }}
                  title={c}
                />
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: "1px", height: "28px", background: "var(--color-surface-200)" }} />

            {/* Stroke size */}
            <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
              {STROKE_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStrokeSize(s)}
                  style={{
                    width:        "32px", height: "32px",
                    borderRadius: "50%", border: "none",
                    background:   strokeSize === s ? "var(--color-primary-50)" : "transparent",
                    cursor:       "pointer",
                    display:      "flex", alignItems: "center", justifyContent: "center",
                    outline:      strokeSize === s ? "2px solid var(--color-primary-300)" : "none",
                    transition:   "all 0.15s",
                  }}
                  title={`${s}px`}
                >
                  <div style={{
                    width:        `${Math.min(s + 4, 20)}px`,
                    height:       `${Math.min(s + 4, 20)}px`,
                    borderRadius: "50%",
                    background:   tool === "eraser" ? "var(--color-surface-300)" : color,
                  }} />
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: "1px", height: "28px", background: "var(--color-surface-200)" }} />

            {/* Clear */}
            <button
              onClick={clearCanvas}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.5rem 0.875rem", borderRadius: "8px",
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "var(--color-error)", fontSize: "0.8125rem",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              <Trash2 size={14} /> Clear
            </button>

            {/* Hint */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {hasDrawing && (
                <span className="clay-badge" style={{
                  background: "var(--color-primary-50)",
                  color: "var(--color-primary-600)",
                  border: "1px solid var(--color-primary-100)",
                }}>
                  ✏️ Has drawing
                </span>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div
            className="clay-card"
            style={{
              flex: 1, overflow: "hidden", position: "relative",
              cursor: tool === "eraser" ? "cell" : "crosshair",
              minHeight: "400px",
              background: "#ffffff",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{ display: "block", width: "100%", height: "100%", touchAction: "none" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />

            {/* Empty state hint */}
            {!hasDrawing && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                pointerEvents: "none",
              }}>
                <p style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✏️</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "#c9bfb3", marginBottom: "0.375rem" }}>
                  Start drawing here
                </p>
                <p style={{ fontSize: "0.8rem", color: "#d4c5aa" }}>
                  Write equations, diagrams, or any problem
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── SOLUTION PANEL ───────────────────────────────── */}
        <div style={{
          width: "360px", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: "0.75rem",
        }}>

          {/* Tips card */}
          {!solution && !solving && (
            <div className="clay-card" style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a8a29e",
                          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>
                Tips
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {[
                  { icon: "✍️", tip: "Write equations clearly — large and spaced out" },
                  { icon: "📐", tip: "Use the thick pen for symbols like +, =, ×"     },
                  { icon: "📷", tip: "Or upload a photo in the AI Assistant instead"   },
                  { icon: "🧮", tip: "Works with algebra, calculus, geometry & more"   },
                  { icon: "💡", tip: "Add context in the title for better results"     },
                ].map((t) => (
                  <div key={t.tip} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{t.icon}</span>
                    <p style={{ fontSize: "0.8rem", color: "#78716c", lineHeight: 1.5 }}>{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solving indicator */}
          {solving && (
            <div className="clay-card" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "var(--color-primary-50)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
                animation: "pulseSoft 1.5s ease-in-out infinite",
              }}>
                <Sparkles size={24} style={{ color: "var(--color-primary-500)" }} />
              </div>
              <p style={{ fontWeight: 700, color: "#1c1917", marginBottom: "0.375rem" }}>
                Analyzing your drawing...
              </p>
              <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
                The AI is reading your work and solving it step by step
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginTop: "1rem" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "var(--color-primary-300)",
                    animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Solution */}
          {solution && !solving && (
            <div className="clay-card" style={{
              flex: 1, overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}>
              {/* Solution header */}
              <div style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--color-surface-200)",
                display: "flex", alignItems: "center", gap: "0.625rem",
              }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Sparkles size={14} style={{ color: "white" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#1c1917" }}>
                    AI Solution
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "#a8a29e" }}>
                    Step-by-step explanation
                  </p>
                </div>
                {/* Re-solve */}
                <button
                  onClick={solveWithAI}
                  style={{
                    padding: "4px 8px", borderRadius: "6px",
                    background: "var(--color-primary-50)",
                    border: "1px solid var(--color-primary-100)",
                    color: "var(--color-primary-600)",
                    fontSize: "0.75rem", fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem",
                  }}
                >
                  <RotateCcw size={11} /> Re-solve
                </button>
              </div>

              {/* Solution content */}
              <div style={{
                flex: 1, overflowY: "auto",
                padding: "1.25rem",
              }}>
                <FormatSolution text={solution} />
              </div>

              {/* Solution footer */}
              <div style={{
                padding: "0.875rem 1.25rem",
                borderTop: "1px solid var(--color-surface-200)",
                display: "flex", gap: "0.5rem",
              }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(solution);
                    toast.success("Copied!");
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: "0.8rem", padding: "0.5rem" }}
                >
                  Copy Solution
                </button>
                <button
                  onClick={saveSession}
                  className="btn-primary"
                  style={{ flex: 1, fontSize: "0.8rem", padding: "0.5rem" }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Session"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}