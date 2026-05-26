// src/components/layout/NotificationBell.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Notification {
  id:         string;
  title:      string;
  body:       string;
  type:       string;
  is_read:    boolean;
  link:       string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  task_due:   { color: "#f59e0b", bg: "#fffbeb", emoji: "⏰" },
  grade_added:{ color: "#22c55e", bg: "#f0fdf4", emoji: "📊" },
  ai_ready:   { color: "#6366f1", bg: "var(--color-primary-50)", emoji: "🤖" },
  motivation: { color: "#ec4899", bg: "#fdf4ff", emoji: "💪" },
  system:     { color: "#78716c", bg: "var(--color-surface-100)", emoji: "🔔" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase  = createClient();
  const panelRef  = useRef<HTMLDivElement>(null);

  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unread = notifs.filter((n) => !n.is_read).length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch on open
  useEffect(() => {
    if (!open) return;
    fetchNotifications();
  }, [open]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifs((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchNotifications() {
    setLoading(true);
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifs(data.notifications ?? []);
    }
    setLoading(false);
  }

  async function markRead(id: string) {
    await fetch("/api/notifications/mark-read", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
    setNotifs((prev) =>
      prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
    );
  }

  async function markAllRead() {
    await fetch("/api/notifications/mark-read", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: "all" }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function clearRead() {
    await fetch("/api/notifications/clear", { method: "POST" });
    setNotifs((prev) => prev.filter((n) => !n.is_read));
  }

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: open ? "var(--color-primary-50)" : "var(--color-surface-100)",
          border: `1px solid ${open ? "var(--color-primary-200)" : "var(--color-surface-200)"}`,
          borderRadius: "10px",
          padding: "0.5rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
        aria-label="Notifications"
      >
        <Bell
          size={18}
          style={{ color: open ? "var(--color-primary-600)" : "#57534e" }}
        />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: "-5px", right: "-5px",
            minWidth: "18px", height: "18px",
            borderRadius: "999px",
            background: "var(--color-error)",
            color: "white",
            fontSize: "0.65rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            padding: "0 3px",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="animate-slide-up"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "380px",
            maxHeight: "520px",
            background: "white",
            borderRadius: "16px",
            border: "1px solid var(--color-surface-200)",
            boxShadow: "var(--shadow-clay-lg)",
            zIndex: 100,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-surface-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Bell size={16} style={{ color: "var(--color-primary-600)" }} />
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#1c1917" }}>
                Notifications
              </span>
              {unread > 0 && (
                <span style={{
                  padding: "1px 7px", borderRadius: "999px",
                  background: "var(--color-primary-50)",
                  color: "var(--color-primary-600)",
                  fontSize: "0.75rem", fontWeight: 700,
                }}>
                  {unread} new
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.375rem" }}>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    padding: "4px 8px", borderRadius: "6px",
                    background: "var(--color-primary-50)",
                    border: "1px solid var(--color-primary-100)",
                    color: "var(--color-primary-600)",
                    fontSize: "0.75rem", fontWeight: 600,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.25rem",
                  }}
                >
                  <Check size={11} /> All read
                </button>
              )}
              <button
                onClick={clearRead}
                style={{
                  padding: "4px 8px", borderRadius: "6px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "var(--color-error)",
                  fontSize: "0.75rem", fontWeight: 600,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "0.25rem",
                }}
              >
                <Trash2 size={11} /> Clear
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "#a8a29e", fontSize: "0.875rem" }}>Loading...</p>
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>🔔</p>
                <p style={{ fontWeight: 600, color: "#1c1917", marginBottom: "0.25rem" }}>
                  All caught up!
                </p>
                <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
                  No notifications right now.
                </p>
              </div>
            ) : (
              notifs.map((notif) => {
                const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system!;
                return (
                  <div
                    key={notif.id}
                    style={{
                      padding: "0.875rem 1.25rem",
                      borderBottom: "1px solid var(--color-surface-50)",
                      background: notif.is_read ? "white" : "var(--color-primary-50)",
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Type icon */}
                    <div style={{
                      width: "34px", height: "34px",
                      borderRadius: "8px",
                      background: config.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: "1rem",
                    }}>
                      {config.emoji}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "0.8375rem", fontWeight: notif.is_read ? 500 : 700,
                        color: "#1c1917", marginBottom: "0.25rem",
                      }}>
                        {notif.title}
                      </p>
                      <p style={{
                        fontSize: "0.8rem", color: "#78716c",
                        lineHeight: 1.4, marginBottom: "0.375rem",
                      }}>
                        {notif.body}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "#a8a29e" }}>
                          {timeAgo(notif.created_at)}
                        </span>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => { markRead(notif.id); setOpen(false); }}
                            style={{
                              fontSize: "0.72rem", color: "var(--color-primary-600)",
                              textDecoration: "none", fontWeight: 600,
                              display: "flex", alignItems: "center", gap: "2px",
                            }}
                          >
                            View <ExternalLink size={10} />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Mark read */}
                    {!notif.is_read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        style={{
                          background: "none", border: "none",
                          cursor: "pointer", color: "#a8a29e",
                          padding: "2px", flexShrink: 0,
                        }}
                        title="Mark as read"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer actions */}
          <div style={{
            padding: "0.875rem 1.25rem",
            borderTop: "1px solid var(--color-surface-100)",
            display: "flex", gap: "0.625rem",
          }}>
            <button
              onClick={() => {
                fetch("/api/email/deadline-reminder", { method: "POST" })
                  .then(() => {
                    fetchNotifications();
                    import("react-hot-toast")
                      .then(({ default: toast }) => toast.success("Deadline reminder sent! 📧"));
                  });
              }}
              style={{
                flex: 1, padding: "0.5rem",
                borderRadius: "8px", fontSize: "0.8rem",
                fontWeight: 600, cursor: "pointer",
                background: "var(--color-surface-50)",
                border: "1px solid var(--color-surface-200)",
                color: "#57534e",
              }}
            >
              ⏰ Send Reminder
            </button>
            <button
              onClick={() => {
                fetch("/api/email/daily-digest", { method: "POST" })
                  .then(() => {
                    fetchNotifications();
                    import("react-hot-toast")
                      .then(({ default: toast }) => toast.success("Daily digest sent! 📬"));
                  });
              }}
              style={{
                flex: 1, padding: "0.5rem",
                borderRadius: "8px", fontSize: "0.8rem",
                fontWeight: 600, cursor: "pointer",
                background: "var(--color-primary-50)",
                border: "1px solid var(--color-primary-100)",
                color: "var(--color-primary-600)",
              }}
            >
              📬 Daily Digest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}