// src/components/ai/AIAssistantClient.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Bot, User, Loader2, Sparkles,
  Plus, Trash2, Image as ImageIcon, X,
  BookOpen, CheckSquare, TrendingUp, Copy, Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Message {
  role:       "user" | "assistant";
  content:    string;
  image?:     string;   // base64 preview
  created_at?: string;
}

interface Profile {
  first_name:          string;
  last_name:           string;
  university_name:     string;
  degree_program:      string;
  current_semester:    number;
  current_cgpa:        number;
  completed_semesters: number;
}

interface Course   { id: string; name: string; color: string; category: string; }
interface Task     { title: string; type: string; due_date?: string; priority: string; status: string; }
interface HistMsg  { role: "user" | "assistant"; content: string; created_at: string; }

const QUICK_PROMPTS = [
  { icon: "📚", label: "Study plan",          prompt: "Create a detailed study plan for my current courses this week"                          },
  { icon: "📊", label: "Grade analysis",       prompt: "Analyze my academic performance and give me improvement suggestions"                   },
  { icon: "✅", label: "Task priorities",      prompt: "Which of my pending tasks should I prioritize and why?"                               },
  { icon: "🧠", label: "Explain a concept",    prompt: "Explain a difficult concept from one of my courses step by step"                      },
  { icon: "💡", label: "Study techniques",     prompt: "What are the best study techniques for my degree program?"                            },
  { icon: "🎯", label: "Exam prep",            prompt: "Help me prepare for my upcoming exams. What should I focus on?"                       },
  { icon: "📝", label: "Summarize notes",      prompt: "Help me create concise summary notes from a topic I'll describe"                     },
  { icon: "🔢", label: "Solve math",           prompt: "I have a math problem I need help with. I'll describe or upload an image of it."     },
];

export default function AIAssistantClient({
  profile, courses, tasks, initialHistory, userId,
}: {
  profile:        Profile;
  courses:        Course[];
  tasks:          Task[];
  initialHistory: HistMsg[];
  userId:         string;
}) {
  const supabase  = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  const [messages,   setMessages]   = useState<Message[]>(
    initialHistory.map((h) => ({ role: h.role, content: h.content }))
  );
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [image,      setImage]      = useState<string | null>(null);     // base64
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [copied,     setCopied]     = useState<number | null>(null);
  const [sideOpen,   setSideOpen]   = useState(true);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Image picker ───────────────────────────────────────────
  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ── Send message ───────────────────────────────────────────
  async function send(text?: string) {
    const content = (text ?? input).trim();
    if ((!content && !image) || loading) return;

    setInput("");
    const userMsg: Message = { role: "user", content, image: image ?? undefined };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    // Clear image after sending
    const sentImage = image;
    removeImage();

    // Save user message to Supabase
    await supabase.from("chat_messages").insert({
      user_id:   userId,
      course_id: null,
      role:      "user",
      content:   content || "[Image uploaded]",
    });

    try {
      const res = await fetch("/api/ai/assistant", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages:  [...messages, userMsg].map((m) => ({
            role:    m.role,
            content: m.content,
            image:   m.image,
          })),
          userId,
          image: sentImage,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data   = await res.json();
      const reply  = data.content ?? "Sorry, I couldn't respond to that.";

      const assistantMsg: Message = { role: "assistant", content: reply };
      setMessages((p) => [...p, assistantMsg]);

      await supabase.from("chat_messages").insert({
        user_id:   userId,
        course_id: null,
        role:      "assistant",
        content:   reply,
      });
    } catch {
      const errMsg = "Something went wrong. Please try again.";
      setMessages((p) => [...p, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  // ── Clear chat ─────────────────────────────────────────────
  async function clearChat() {
    if (!confirm("Clear all chat history? This cannot be undone.")) return;
    await supabase
      .from("chat_messages")
      .delete()
      .eq("user_id", userId)
      .is("course_id", null);
    setMessages([]);
    toast.success("Chat cleared.");
  }

  // ── Copy message ───────────────────────────────────────────
  async function copyMsg(idx: number, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Format AI message (basic markdown-like) ────────────────
  function formatContent(text: string) {
    const lines   = text.split("\n");
    const result: React.ReactNode[] = [];
    let   listBuf: string[]         = [];

    function flushList() {
      if (!listBuf.length) return;
      result.push(
        <ul key={`ul-${result.length}`}
          style={{ paddingLeft: "1.25rem", margin: "0.5rem 0", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {listBuf.map((item, i) => (
            <li key={i} style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#1c1917" }}>
              {item.replace(/^[-*]\s/, "")}
            </li>
          ))}
        </ul>
      );
      listBuf = [];
    }

    lines.forEach((line, i) => {
      if (/^#{1,3}\s/.test(line)) {
        flushList();
        const level = line.match(/^#+/)![0].length;
        const text  = line.replace(/^#+\s/, "");
        result.push(
          <p key={i} style={{
            fontWeight: 700, fontSize: level === 1 ? "1rem" : "0.9375rem",
            color: "#1c1917", margin: "0.75rem 0 0.25rem",
          }}>
            {text}
          </p>
        );
      } else if (/^[-*]\s/.test(line)) {
        listBuf.push(line);
      } else if (line.trim() === "") {
        flushList();
        result.push(<div key={i} style={{ height: "0.5rem" }} />);
      } else {
        flushList();
        // Inline code
        const parts = line.split(/(`[^`]+`)/g);
        result.push(
          <p key={i} style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#1c1917", margin: "0.125rem 0" }}>
            {parts.map((part, j) =>
              part.startsWith("`") && part.endsWith("`")
                ? <code key={j} style={{
                    background: "var(--color-surface-200)", borderRadius: "4px",
                    padding: "1px 5px", fontFamily: "monospace", fontSize: "0.8125rem",
                  }}>{part.slice(1, -1)}</code>
                : part
            )}
          </p>
        );
      }
    });

    flushList();
    return result;
  }

  const overdueTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date()
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px - 3rem)", gap: "1.5rem" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
      {sideOpen && (
        <div style={{
          width: "260px", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: "1rem",
          overflowY: "auto",
        }}>
          {/* New chat */}
          <button
            className="btn-primary"
            style={{ width: "100%" }}
            onClick={clearChat}
          >
            <Plus size={15} /> New Conversation
          </button>

          {/* Student snapshot */}
          <div className="clay-card" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a8a29e",
                        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>
              Your Context
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <ContextRow icon={<TrendingUp size={13} />} label="CGPA" value={profile.current_cgpa?.toFixed(2) ?? "—"} />
              <ContextRow icon={<BookOpen   size={13} />} label="Semester" value={`Sem ${profile.current_semester}`} />
              <ContextRow icon={<BookOpen   size={13} />} label="Courses"  value={`${courses.length} active`} />
              <ContextRow icon={<CheckSquare size={13} />} label="Tasks"   value={`${tasks.length} pending`} />
            </div>

            {overdueTasks.length > 0 && (
              <div style={{
                marginTop: "0.875rem", padding: "0.625rem",
                background: "#fef2f2", borderRadius: "8px",
                border: "1px solid #fecaca",
              }}>
                <p style={{ fontSize: "0.75rem", color: "var(--color-error)", fontWeight: 600 }}>
                  ⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Active courses */}
          {courses.length > 0 && (
            <div className="clay-card" style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a8a29e",
                          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>
                Active Courses
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {courses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => send(`Tell me about ${c.name} and give me study tips for it`)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.5rem 0.625rem", borderRadius: "8px",
                      background: "var(--color-surface-50)",
                      border: "1px solid var(--color-surface-200)",
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--color-primary-50)";
                      e.currentTarget.style.borderColor = "var(--color-primary-200)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--color-surface-50)";
                      e.currentTarget.style.borderColor = "var(--color-surface-200)";
                    }}
                  >
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: c.color ?? "#6366f1", flexShrink: 0,
                    }} />
                    <span style={{ fontSize: "0.8rem", color: "#44403c", fontWeight: 500,
                                   overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick prompts */}
          <div className="clay-card" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a8a29e",
                        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>
              Quick Prompts
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => send(qp.prompt)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.5rem 0.625rem", borderRadius: "8px",
                    background: "var(--color-surface-50)",
                    border: "1px solid var(--color-surface-200)",
                    cursor: "pointer", textAlign: "left",
                    fontSize: "0.8rem", color: "#44403c",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-primary-50)";
                    e.currentTarget.style.borderColor = "var(--color-primary-200)";
                    e.currentTarget.style.color = "var(--color-primary-700)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--color-surface-50)";
                    e.currentTarget.style.borderColor = "var(--color-surface-200)";
                    e.currentTarget.style.color = "#44403c";
                  }}
                >
                  <span>{qp.icon}</span>
                  <span style={{ fontWeight: 500 }}>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CHAT ─────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        minWidth: 0, position: "relative",
      }}>
        <div className="clay-card" style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Chat header */}
          <div style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--color-surface-200)",
            display: "flex", alignItems: "center", gap: "0.875rem",
          }}>
            <button
              onClick={() => setSideOpen(!sideOpen)}
              style={{
                background: "var(--color-surface-100)",
                border: "1px solid var(--color-surface-200)",
                borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex",
              }}
              title={sideOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <Sparkles size={15} style={{ color: "#78716c" }} />
            </button>

            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Bot size={18} style={{ color: "white" }} />
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#1c1917" }}>
                UNIMIND AI Assistant
              </p>
              <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
                Knows your profile · courses · tasks · never forgets
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: "0.75rem", color: "#78716c" }}>
                {messages.length} messages
              </span>
            </div>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                style={{
                  display: "flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.375rem 0.75rem", borderRadius: "8px",
                  background: "#fef2f2", border: "1px solid #fecaca",
                  color: "var(--color-error)", fontSize: "0.8rem",
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                <Trash2 size={13} /> Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "1.5rem",
            display: "flex", flexDirection: "column", gap: "1.25rem",
          }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", gap: "1.25rem",
                padding: "2rem",
              }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--color-primary-50), #f0fdf4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid var(--color-primary-100)",
                }}>
                  <Sparkles size={30} style={{ color: "var(--color-primary-600)" }} />
                </div>

                <div style={{ textAlign: "center", maxWidth: "480px" }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>
                    Hello, {profile.first_name}! 👋
                  </h2>
                  <p style={{ color: "#78716c", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    I know your courses, your grades, your pending tasks, and your
                    university profile. Ask me anything — or upload a photo of a
                    problem and I'll solve it step by step.
                  </p>
                </div>

                {/* Capability pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                  {[
                    "📸 Solve from photo",
                    "📊 Analyze grades",
                    "📅 Plan your week",
                    "🔢 Math step-by-step",
                    "✍️ Write & summarize",
                    "💡 Explain concepts",
                  ].map((cap) => (
                    <span key={cap} className="clay-badge" style={{
                      background: "var(--color-surface-100)",
                      border: "1px solid var(--color-surface-200)",
                      color: "#57534e", padding: "0.375rem 0.875rem",
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
                  Use quick prompts on the left or type below
                </p>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                    : "var(--color-surface-200)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {msg.role === "user"
                    ? <User size={14} style={{ color: "white" }} />
                    : <Bot  size={14} style={{ color: "#78716c" }} />
                  }
                </div>

                {/* Bubble */}
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>

                  {/* Image preview */}
                  {msg.image && (
                    <div style={{
                      borderRadius: "12px", overflow: "hidden",
                      border: "1px solid var(--color-surface-200)",
                      maxWidth: "300px",
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.image}
                        alt="Uploaded"
                        style={{ width: "100%", display: "block" }}
                      />
                    </div>
                  )}

                  {/* Text bubble */}
                  {msg.content && (
                    <div style={{
                      padding: "0.875rem 1.125rem",
                      borderRadius: msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))"
                        : "white",
                      border: msg.role === "assistant" ? "1px solid var(--color-surface-200)" : "none",
                      boxShadow: "var(--shadow-clay-sm)",
                      position: "relative",
                    }}>
                      {msg.role === "user" ? (
                        <p style={{ fontSize: "0.875rem", color: "white", lineHeight: 1.6 }}>
                          {msg.content}
                        </p>
                      ) : (
                        <div>{formatContent(msg.content)}</div>
                      )}

                      {/* Copy button for assistant */}
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => copyMsg(i, msg.content)}
                          style={{
                            position: "absolute", top: "0.5rem", right: "0.5rem",
                            background: "var(--color-surface-100)",
                            border: "1px solid var(--color-surface-200)",
                            borderRadius: "6px", padding: "3px", cursor: "pointer",
                            display: "flex", opacity: 0.7,
                            transition: "opacity 0.15s",
                          }}
                          title="Copy response"
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                        >
                          {copied === i
                            ? <Check  size={12} style={{ color: "#22c55e" }} />
                            : <Copy   size={12} style={{ color: "#78716c" }} />
                          }
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "var(--color-surface-200)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={14} style={{ color: "#78716c" }} />
                </div>
                <div style={{
                  padding: "0.875rem 1.125rem", borderRadius: "18px 18px 18px 4px",
                  background: "white", border: "1px solid var(--color-surface-200)",
                  boxShadow: "var(--shadow-clay-sm)",
                  display: "flex", alignItems: "center", gap: "0.75rem",
                }}>
                  <Loader2 size={16} style={{ color: "var(--color-primary-500)", animation: "spin 1s linear infinite" }} />
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "var(--color-primary-300)",
                        animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#a8a29e" }}>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Image preview strip */}
          {image && (
            <div style={{
              padding: "0.75rem 1.5rem",
              borderTop: "1px solid var(--color-surface-200)",
              background: "var(--color-surface-50)",
              display: "flex", alignItems: "center", gap: "0.875rem",
            }}>
              <div style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Preview"
                  style={{
                    width: "56px", height: "56px", borderRadius: "8px",
                    objectFit: "cover", border: "1px solid var(--color-surface-200)",
                  }}
                />
                <button
                  onClick={removeImage}
                  style={{
                    position: "absolute", top: "-6px", right: "-6px",
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: "var(--color-error)", border: "none",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={10} style={{ color: "white" }} />
                </button>
              </div>
              <div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1c1917" }}>
                  {imageFile?.name}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
                  Image ready to send · I'll analyze and solve it
                </p>
              </div>
            </div>
          )}

          {/* Input area */}
          <div style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-surface-200)",
            display: "flex", gap: "0.75rem", alignItems: "flex-end",
          }}>
            {/* Image upload button */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImagePick}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: "0.625rem", borderRadius: "10px", flexShrink: 0,
                background: image ? "var(--color-primary-50)" : "var(--color-surface-100)",
                border: `1px solid ${image ? "var(--color-primary-200)" : "var(--color-surface-200)"}`,
                cursor: "pointer", display: "flex",
                color: image ? "var(--color-primary-600)" : "#78716c",
                transition: "all 0.15s",
              }}
              title="Upload image (photo of problem, handwritten notes)"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-primary-50)";
                e.currentTarget.style.borderColor = "var(--color-primary-200)";
              }}
              onMouseLeave={(e) => {
                if (!image) {
                  e.currentTarget.style.background = "var(--color-surface-100)";
                  e.currentTarget.style.borderColor = "var(--color-surface-200)";
                }
              }}
            >
              <ImageIcon size={18} />
            </button>

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                image
                  ? "Describe what you need help with (or just press send)..."
                  : "Ask anything... (Enter to send · Shift+Enter for new line · 📷 upload image)"
              }
              rows={1}
              style={{
                flex: 1, resize: "none",
                padding: "0.75rem 1rem",
                background: "var(--color-surface-50)",
                border: "1px solid var(--color-surface-300)",
                borderRadius: "12px", outline: "none",
                fontSize: "0.9rem", fontFamily: "inherit",
                lineHeight: 1.5, color: "#1c1917",
                transition: "border-color 0.2s, box-shadow 0.2s",
                maxHeight: "160px", overflowY: "auto",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary-400)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgb(99 102 241 / 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-surface-300)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            {/* Send button */}
            <button
              onClick={() => send()}
              disabled={(!input.trim() && !image) || loading}
              className="btn-primary"
              style={{ padding: "0.75rem", flexShrink: 0 }}
              aria-label="Send"
            >
              {loading
                ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                : <Send size={18} />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper
function ContextRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#78716c" }}>
        {icon}
        <span style={{ fontSize: "0.8rem" }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#44403c" }}>{value}</span>
    </div>
  );
}

// Needed for formatContent used inside component
function formatContent(text: string): React.ReactNode[] {
  const lines   = text.split("\n");
  const result: React.ReactNode[] = [];
  let   listBuf: string[]         = [];

  function flushList() {
    if (!listBuf.length) return;
    result.push(
      <ul key={`ul-${result.length}`}
        style={{ paddingLeft: "1.25rem", margin: "0.5rem 0", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {listBuf.map((item, i) => (
          <li key={i} style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#1c1917" }}>
            {item.replace(/^[-*]\s/, "")}
          </li>
        ))}
      </ul>
    );
    listBuf = [];
  }

  lines.forEach((line, i) => {
    if (/^#{1,3}\s/.test(line)) {
      flushList();
      const level = line.match(/^#+/)![0].length;
      const txt   = line.replace(/^#+\s/, "");
      result.push(
        <p key={i} style={{
          fontWeight: 700,
          fontSize: level === 1 ? "1rem" : "0.9375rem",
          color: "#1c1917",
          margin: "0.75rem 0 0.25rem",
        }}>
          {txt}
        </p>
      );
    } else if (/^[-*]\s/.test(line)) {
      listBuf.push(line);
    } else if (line.trim() === "") {
      flushList();
      result.push(<div key={i} style={{ height: "0.5rem" }} />);
    } else {
      flushList();
      const parts = line.split(/(`[^`]+`)/g);
      result.push(
        <p key={i} style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#1c1917", margin: "0.125rem 0" }}>
          {parts.map((part, j) =>
            part.startsWith("`") && part.endsWith("`")
              ? <code key={j} style={{
                  background: "var(--color-surface-200)",
                  borderRadius: "4px", padding: "1px 5px",
                  fontFamily: "monospace", fontSize: "0.8125rem",
                }}>{part.slice(1, -1)}</code>
              : part
          )}
        </p>
      );
    }
  });

  flushList();
  return result;
}