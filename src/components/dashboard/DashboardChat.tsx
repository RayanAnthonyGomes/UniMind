// src/components/dashboard/DashboardChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

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

  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [isOpen,   setIsOpen]   = useState(false);

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

      const data  = await res.json();
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
    <div className="glass-card-static" style={{ overflow: "hidden" }}>

      {/* Header — click to expand/collapse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          background: "none", border: "none", cursor: "pointer",
          borderBottom: isOpen ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
          textAlign: "left",
          color: "inherit",
        }}
      >
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "linear-gradient(135deg, #7c3aed, #6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 0 20px -3px rgba(124, 58, 237, 0.4)",
        }}>
          <Sparkles size={18} style={{ color: "white" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontWeight: 700, fontSize: "0.9375rem",
            color: "var(--color-text-primary)", fontFamily: "var(--font-display)",
          }}>
            Ask me anything...
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            Your AI study companion — always here, never forgets
          </p>
        </div>
        <ChevronUp
          size={16}
          style={{
            color: "var(--color-text-muted)",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.25s ease",
          }}
        />
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

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                height: "100%", gap: "1rem",
              }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "rgba(124, 58, 237, 0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 25px -5px rgba(124, 58, 237, 0.25)",
                }}>
                  <Bot size={24} style={{ color: "var(--color-primary-300)" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontWeight: 600, color: "var(--color-text-primary)",
                    marginBottom: "0.25rem", fontFamily: "var(--font-display)",
                  }}>
                    Hi! I&apos;m your UNIMIND AI
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    Ask me about your courses, tasks, grades, or anything else.
                  </p>
                </div>

                {/* Suggestion chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      style={{
                        padding: "0.4rem 0.875rem", borderRadius: "999px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        fontSize: "0.8rem", color: "var(--color-text-secondary)",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(124, 58, 237, 0.10)";
                        e.currentTarget.style.color = "var(--color-primary-300)";
                        e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.color = "var(--color-text-secondary)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: "0.625rem",
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                    : "rgba(255, 255, 255, 0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: msg.role === "user" ? "0 0 12px rgba(124, 58, 237, 0.3)" : "none",
                }}>
                  {msg.role === "user"
                    ? <User size={13} style={{ color: "white" }} />
                    : <Bot  size={13} style={{ color: "var(--color-primary-300)" }} />
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: "75%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: msg.role === "user"
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                    : "rgba(255, 255, 255, 0.04)",
                  border: msg.role === "user"
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  color: msg.role === "user" ? "white" : "var(--color-text-primary)",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                }}>
                  {msg.role === "user" ? (
                    <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "white", fontSize: "0.875rem", lineHeight: 1.6 }}>
                      {msg.content}
                    </p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={13} style={{ color: "var(--color-primary-300)" }} />
                </div>
                <div style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "var(--color-primary-400)",
                        animation: `pulseDot 1.4s ease-in-out ${i * 0.16}s infinite`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
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
              placeholder="Ask me anything... (Enter to send)"
              rows={1}
              className="clay-input"
              style={{
                flex: 1, resize: "none",
                maxHeight: "120px", overflowY: "auto",
                lineHeight: 1.5,
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