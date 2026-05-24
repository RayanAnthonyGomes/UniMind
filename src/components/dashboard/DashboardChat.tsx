// src/components/dashboard/DashboardChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What tasks are due this week?",
  "Summarize my current semester",
  "Help me make a study plan",
  "What should I focus on today?",
];

export default function DashboardChat({ userId }: { userId: string }) {
  const supabase  = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [isOpen,    setIsOpen]    = useState(false);

  // Load chat history from Supabase on mount
  useEffect(() => {
    async function loadHistory() {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", userId)
        .is("course_id", null)
        .order("created_at", { ascending: true })
        .limit(50);

      if (data && data.length > 0) {
        setMessages(data as Message[]);
      }
    }
    loadHistory();
  }, [userId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setInput("");
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Save user message to Supabase
    await supabase.from("chat_messages").insert({
      user_id:   userId,
      course_id: null,
      role:      "user",
      content,
    });

    try {
      const res = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages: [...messages, userMsg],
          userId,
          courseId: null,
        }),
      });

      const data = await res.json();
      const reply = data.content ?? "Sorry, I couldn't process that.";

      const assistantMsg: Message = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMsg]);

      // Save assistant message to Supabase
      await supabase.from("chat_messages").insert({
        user_id:   userId,
        course_id: null,
        role:      "assistant",
        content:   reply,
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="clay-card" style={{ overflow: "hidden" }}>

      {/* Header — click to expand/collapse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          background: "none", border: "none", cursor: "pointer",
          borderBottom: isOpen ? "1px solid var(--color-surface-200)" : "none",
          textAlign: "left",
        }}
      >
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Sparkles size={18} style={{ color: "white" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#1c1917" }}>
            Ask me anything...
          </p>
          <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
            Your AI study companion — always here, never forgets
          </p>
        </div>
        <span style={{ fontSize: "0.75rem", color: "#a8a29e", transform: isOpen ? "rotate(180deg)" : "none",
                       transition: "0.2s" }}>
          ▲
        </span>
      </button>

      {/* Chat body */}
      {isOpen && (
        <div>
          {/* Messages */}
          <div style={{
            height: "360px", overflowY: "auto",
            padding: "1.25rem 1.5rem",
            display: "flex", flexDirection: "column", gap: "1rem",
          }}>
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                            justifyContent: "center", height: "100%", gap: "1rem" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "var(--color-primary-50)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={24} style={{ color: "var(--color-primary-600)" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 600, color: "#1c1917", marginBottom: "0.25rem" }}>
                    Hi! I'm your UNIMIND AI
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#78716c" }}>
                    Ask me about your courses, tasks, grades, or anything else.
                  </p>
                </div>

                {/* Suggestion chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      style={{
                        padding: "0.4rem 0.875rem", borderRadius: "999px",
                        background: "var(--color-surface-100)",
                        border: "1px solid var(--color-surface-200)",
                        fontSize: "0.8rem", color: "#57534e",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--color-primary-50)";
                        e.currentTarget.style.color = "var(--color-primary-700)";
                        e.currentTarget.style.borderColor = "var(--color-primary-200)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--color-surface-100)";
                        e.currentTarget.style.color = "#57534e";
                        e.currentTarget.style.borderColor = "var(--color-surface-200)";
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
                gap: "0.625rem", alignItems: "flex-start",
              }}>
                {/* Avatar */}
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                    : "var(--color-surface-200)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {msg.role === "user"
                    ? <User size={13} style={{ color: "white" }} />
                    : <Bot  size={13} style={{ color: "#78716c" }} />
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: "75%",
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
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "var(--color-surface-200)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={13} style={{ color: "#78716c" }} />
                </div>
                <div style={{
                  padding: "0.625rem 0.875rem", borderRadius: "14px 14px 14px 4px",
                  background: "var(--color-surface-100)",
                  display: "flex", alignItems: "center", gap: "0.375rem",
                }}>
                  <Loader2 size={14} style={{ color: "#a8a29e", animation: "spin 1s linear infinite" }} />
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
            display: "flex", gap: "0.75rem", alignItems: "flex-end",
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{
                flex: 1, resize: "none",
                padding: "0.625rem 1rem",
                background: "var(--color-surface-50)",
                border: "1px solid var(--color-surface-300)",
                borderRadius: "10px", outline: "none",
                fontSize: "0.875rem", fontFamily: "inherit",
                lineHeight: 1.5, color: "#1c1917",
                transition: "border-color 0.2s",
                maxHeight: "120px", overflowY: "auto",
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
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary"
              style={{ padding: "0.625rem", flexShrink: 0 }}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}