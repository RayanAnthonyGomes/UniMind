// src/components/ai/AIAssistantClient.tsx
"use client";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { useState, useRef, useEffect } from "react";
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
  image?:     string;
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
  { icon: "📚", label: "Study plan",          prompt: "Create a detailed study plan for my current courses this week" },
  { icon: "📊", label: "Grade analysis",       prompt: "Analyze my academic performance and give me improvement suggestions" },
  { icon: "✅", label: "Task priorities",      prompt: "Which of my pending tasks should I prioritize and why?" },
  { icon: "🧠", label: "Explain a concept",    prompt: "Explain a difficult concept from one of my courses step by step" },
  { icon: "💡", label: "Study techniques",     prompt: "What are the best study techniques for my degree program?" },
  { icon: "🎯", label: "Exam prep",            prompt: "Help me prepare for my upcoming exams. What should I focus on?" },
  { icon: "📝", label: "Summarize notes",      prompt: "Help me create concise summary notes from a topic I'll describe" },
  { icon: "🔢", label: "Solve math",           prompt: "I have a math problem I need help with. I'll describe or upload an image of it." },
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

  const [messages,   setMessages]   = useState<Message[]>(initialHistory.map((h) => ({ role: h.role, content: h.content })));
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [image,      setImage]      = useState<string | null>(null);
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [copied,     setCopied]     = useState<number | null>(null);
  const [sideOpen,   setSideOpen]   = useState(true);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large. Max 5MB."); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null); setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if ((!content && !image) || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content, image: image ?? undefined };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);
    const sentImage = image;
    removeImage();
    await supabase.from("chat_messages").insert({ user_id: userId, course_id: null, role: "user", content: content || "[Image uploaded]" });
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content, image: m.image })), userId, image: sentImage }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const reply = data.content ?? "Sorry, I couldn't respond to that.";
      const assistantMsg: Message = { role: "assistant", content: reply };
      setMessages((p) => [...p, assistantMsg]);
      await supabase.from("chat_messages").insert({ user_id: userId, course_id: null, role: "assistant", content: reply });
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false); inputRef.current?.focus();
    }
  }

  async function clearChat() {
    if (!confirm("Clear all chat history? This cannot be undone.")) return;
    await supabase.from("chat_messages").delete().eq("user_id", userId).is("course_id", null);
    setMessages([]);
    toast.success("Chat cleared.");
  }

  async function copyMsg(idx: number, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(idx); setTimeout(() => setCopied(null), 2000);
  }

  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date());

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px - 3rem)", gap: "1.5rem" }}>
      {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
      {sideOpen && (
        <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <button className="btn-primary" style={{ width: "100%" }} onClick={clearChat}>
            <Plus size={15} /> New Conversation
          </button>

          <div className="glass-card-static" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>Your Context</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <ContextRow icon={<TrendingUp size={13} />} label="CGPA" value={profile.current_cgpa?.toFixed(2) ?? "—"} />
              <ContextRow icon={<BookOpen size={13} />} label="Semester" value={`Sem ${profile.current_semester}`} />
              <ContextRow icon={<BookOpen size={13} />} label="Courses" value={`${courses.length} active`} />
              <ContextRow icon={<CheckSquare size={13} />} label="Tasks" value={`${tasks.length} pending`} />
            </div>
            {overdueTasks.length > 0 && (
              <div style={{ marginTop: "0.875rem", padding: "0.625rem", background: "rgba(248, 113, 113, 0.1)", borderRadius: "8px", border: "1px solid rgba(248, 113, 113, 0.2)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--color-error)", fontWeight: 600 }}>⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}</p>
              </div>
            )}
          </div>

          {courses.length > 0 && (
            <div className="glass-card-static" style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>Active Courses</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {courses.map((c) => (
                  <button key={c.id} onClick={() => send(`Tell me about ${c.name} and give me study tips for it`)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.625rem", borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)"; e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.25)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)"; }}
                  >
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.color ?? "#818cf8", flexShrink: 0, boxShadow: `0 0 6px ${c.color}60` }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card-static" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>Quick Prompts</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {QUICK_PROMPTS.map((qp) => (
                <button key={qp.label} onClick={() => send(qp.prompt)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.625rem", borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)",
                    cursor: "pointer", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-secondary)", transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)"; e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.25)"; e.currentTarget.style.color = "var(--color-primary-300)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
                >
                  <span>{qp.icon}</span><span style={{ fontWeight: 500 }}>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CHAT ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
        <div className="glass-card-static" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <button onClick={() => setSideOpen(!sideOpen)}
              style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }} title={sideOpen ? "Hide sidebar" : "Show sidebar"}>
              <Sparkles size={15} style={{ color: "var(--color-text-muted)" }} />
            </button>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 15px rgba(124, 58, 237, 0.4)" }}>
              <Bot size={18} style={{ color: "white" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>UNIMIND AI Assistant</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Knows your profile · courses · tasks · never forgets</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px rgba(52, 211, 153, 0.5)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{messages.length} messages</span>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: "8px", background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.2)", color: "var(--color-error)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                <Trash2 size={13} /> Clear
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "1.25rem", padding: "2rem" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(99, 102, 241, 0.15))", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(124, 58, 237, 0.25)", boxShadow: "0 0 40px rgba(124, 58, 237, 0.2)" }}>
                  <Sparkles size={30} style={{ color: "var(--color-primary-400)" }} />
                </div>
                <div style={{ textAlign: "center", maxWidth: "480px" }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem", fontFamily: "var(--font-display)" }}>Hello, {profile.first_name}! 👋</h2>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>I know your courses, your grades, your pending tasks, and your university profile. Ask me anything — or upload a photo of a problem and I'll solve it step by step.</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                  {["📸 Solve from photo", "📊 Analyze grades", "📅 Plan your week", "🔢 Math step-by-step", "✍️ Write & summarize", "💡 Explain concepts"].map((cap) => (
                    <span key={cap} className="clay-badge" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--color-text-secondary)", padding: "0.375rem 0.875rem" }}>{cap}</span>
                  ))}
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Use quick prompts on the left or type below</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: msg.role === "user" ? "linear-gradient(135deg, #7c3aed, #6366f1)" : "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: msg.role === "user" ? "0 0 10px rgba(124, 58, 237, 0.3)" : "none" }}>
                  {msg.role === "user" ? <User size={14} style={{ color: "white" }} /> : <Bot size={14} style={{ color: "var(--color-text-muted)" }} />}
                </div>
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {msg.image && (
                    <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.08)", maxWidth: "300px" }}>
                      <img src={msg.image} alt="Uploaded" style={{ width: "100%", display: "block" }} />
                    </div>
                  )}
                  {msg.content && (
                    <div style={{ padding: "0.875rem 1.125rem", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))" : "rgba(255, 255, 255, 0.03)", border: msg.role === "assistant" ? "1px solid rgba(255, 255, 255, 0.08)" : "none", position: "relative" }}>
                      {msg.role === "user" ? (
                        <p style={{ fontSize: "0.875rem", color: "white", lineHeight: 1.6 }}>{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                      {msg.role === "assistant" && (
                        <button onClick={() => copyMsg(i, msg.content)} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", padding: "3px", cursor: "pointer", display: "flex", opacity: 0.7, transition: "opacity 0.15s" }} title="Copy response" onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
                          {copied === i ? <Check size={12} style={{ color: "#34d399" }} /> : <Copy size={12} style={{ color: "var(--color-text-muted)" }} />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={14} style={{ color: "var(--color-text-muted)" }} />
                </div>
                <div style={{ padding: "0.875rem 1.125rem", borderRadius: "18px 18px 18px 4px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Loader2 size={16} style={{ color: "var(--color-primary-400)", animation: "spin 1s linear infinite" }} />
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (<span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-primary-400)", animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />))}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {image && (
            <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", background: "rgba(255, 255, 255, 0.02)", display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div style={{ position: "relative" }}>
                <img src={image} alt="Preview" style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(255, 255, 255, 0.1)" }} />
                <button onClick={removeImage} style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--color-error)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={10} style={{ color: "white" }} /></button>
              </div>
              <div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{imageFile?.name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Image ready to send · I'll analyze and solve it</p>
              </div>
            </div>
          )}

          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagePick} />
            <button onClick={() => fileRef.current?.click()} style={{ padding: "0.625rem", borderRadius: "10px", flexShrink: 0, background: image ? "rgba(124, 58, 237, 0.15)" : "rgba(255, 255, 255, 0.03)", border: `1px solid ${image ? "rgba(124, 58, 237, 0.25)" : "rgba(255, 255, 255, 0.08)"}`, cursor: "pointer", display: "flex", color: image ? "var(--color-primary-300)" : "var(--color-text-muted)", transition: "all 0.15s" }} title="Upload image (photo of problem, handwritten notes)" onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)"; e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.25)"; }} onMouseLeave={(e) => { if (!image) { e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"; } }}>
              <ImageIcon size={18} />
            </button>
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={image ? "Describe what you need help with (or just press send)..." : "Ask anything... (Enter to send · Shift+Enter for new line · 📷 upload image)"} rows={1} className="clay-input" style={{ flex: 1, resize: "none", maxHeight: "160px", overflowY: "auto", lineHeight: 1.5 }} />
            <button onClick={() => send()} disabled={(!input.trim() && !image) || loading} className="btn-primary" style={{ padding: "0.75rem", flexShrink: 0 }} aria-label="Send">
              {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-text-muted)" }}>
        {icon}
        <span style={{ fontSize: "0.8rem" }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>{value}</span>
    </div>
  );
}