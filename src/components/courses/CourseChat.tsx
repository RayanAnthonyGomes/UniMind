// src/components/courses/CourseChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Summarize what I've uploaded so far",
  "Create a study plan for this course",
  "What are the key topics I should focus on?",
  "Help me understand a concept from this course",
  "Generate practice questions for me",
];

export default function CourseChat({
  courseId, userId, courseName,
}: {
  courseId:   string;
  userId:     string;
  courseName: string;
}) {
  const supabase  = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Load this course's chat history
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data?.length) setMessages(data as Message[]);
    }
    load();
  }, [courseId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setInput("");
    const userMsg: Message = { role: "user", content };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    await supabase.from("chat_messages").insert({
      user_id: userId, course_id: courseId, role: "user", content,
    });

    try {
      const res = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages: [...messages, userMsg],
          userId,
          courseId,
        }),
      });
      const data  = await res.json();
      const reply = data.content ?? "Sorry, I couldn't respond.";

      const assistantMsg: Message = { role: "assistant", content: reply };
      setMessages((p) => [...p, assistantMsg]);

      await supabase.from("chat_messages").insert({
        user_id: userId, course_id: courseId, role: "assistant", content: reply,
      });
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="clay-card" style={{ display: "flex", flexDirection: "column", height: "620px", overflow: "hidden" }}>

      {/* Header */}
      <div style={{
        padding: "1.25rem 1.5rem",
        borderBottom: "1px solid var(--color-surface-200)",
        display: "flex", alignItems: "center", gap: "0.75rem",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <BookOpen size={17} style={{ color: "white" }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1c1917" }}>
            {courseName} AI
          </p>
          <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
            Knows your uploaded materials · Never forgets
          </p>
        </div>
        {/* Live indicator */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: "0.75rem", color: "#78716c" }}>Live</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem",
                    display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", height: "100%", gap: "1rem" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "var(--color-primary-50)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={22} style={{ color: "var(--color-primary-600)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600, color: "#1c1917", marginBottom: "0.25rem" }}>
                {courseName} AI is ready
              </p>
              <p style={{ fontSize: "0.8rem", color: "#78716c", maxWidth: "280px" }}>
                Ask about your course materials, get summaries, or request practice questions.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", width: "100%" }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  style={{
                    padding: "0.5rem 0.875rem", borderRadius: "8px",
                    background: "var(--color-surface-50)",
                    border: "1px solid var(--color-surface-200)",
                    fontSize: "0.8rem", color: "#57534e",
                    cursor: "pointer", textAlign: "left",
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
                    e.currentTarget.style.color = "#57534e";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            gap: "0.5rem", alignItems: "flex-start",
          }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
              background: msg.role === "user"
                ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                : "var(--color-surface-200)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {msg.role === "user"
                ? <User size={12} style={{ color: "white" }} />
                : <Bot  size={12} style={{ color: "#78716c" }} />
              }
            </div>
            <div style={{
              maxWidth: "80%",
              padding: "0.625rem 0.875rem",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? "var(--color-primary-600)" : "var(--color-surface-100)",
              color: msg.role === "user" ? "white" : "#1c1917",
              fontSize: "0.875rem", lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: "var(--color-surface-200)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={12} style={{ color: "#78716c" }} />
            </div>
            <div style={{
              padding: "0.625rem 0.875rem", borderRadius: "14px 14px 14px 4px",
              background: "var(--color-surface-100)",
              display: "flex", alignItems: "center", gap: "0.375rem",
            }}>
              <Loader2 size={13} style={{ color: "#a8a29e", animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "0.8rem", color: "#a8a29e" }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "1rem 1.5rem",
        borderTop: "1px solid var(--color-surface-200)",
        display: "flex", gap: "0.625rem", alignItems: "flex-end",
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about this course... (Enter to send)"
          rows={1}
          style={{
            flex: 1, resize: "none",
            padding: "0.625rem 1rem",
            background: "var(--color-surface-50)",
            border: "1px solid var(--color-surface-300)",
            borderRadius: "10px", outline: "none",
            fontSize: "0.875rem", fontFamily: "inherit",
            lineHeight: 1.5, color: "#1c1917",
            transition: "border-color 0.2s, box-shadow 0.2s",
            maxHeight: "100px", overflowY: "auto",
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
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="btn-primary"
          style={{ padding: "0.625rem", flexShrink: 0 }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}