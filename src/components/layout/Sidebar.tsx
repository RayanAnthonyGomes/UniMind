// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, BarChart2, CheckSquare,
  Bot, PenTool, Sparkles, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

const NAV = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/courses",        icon: BookOpen,         label: "Courses"       },
  { href: "/grades",         icon: BarChart2,        label: "Grades"        },
  { href: "/tasks",          icon: CheckSquare,      label: "Tasks"         },
  { href: "/ai-assistant",   icon: Bot,              label: "AI Assistant"  },
  { href: "/drawing-board",  icon: PenTool,          label: "Drawing Board" },
  { href: "/motivation",     icon: Sparkles,         label: "Motivation"    },
];

export default function Sidebar({ profile }: { profile: User }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const width = collapsed ? "72px" : "240px";

  return (
    <aside
      style={{
        width,
        minWidth: width,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "white",
        borderRight: "1px solid var(--color-surface-200)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease, min-width 0.25s ease",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Logo + collapse button */}
      <div style={{
        padding: "1.25rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: "1px solid var(--color-surface-100)",
        minHeight: "64px",
      }}>
        {!collapsed && (
          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>U</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1c1917", whiteSpace: "nowrap" }}>
              UNI<span style={{ color: "var(--color-primary-600)" }}>MIND</span>
            </span>
          </Link>
        )}

        {collapsed && (
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>U</span>
          </div>
        )}

        {!collapsed && (
          <button onClick={() => setCollapsed(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e", padding: "4px", borderRadius: "6px" }}
            aria-label="Collapse sidebar">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)}
          style={{
            margin: "0.75rem auto", background: "var(--color-surface-100)",
            border: "1px solid var(--color-surface-200)", borderRadius: "8px",
            cursor: "pointer", color: "#78716c", padding: "6px", display: "flex",
          }}
          aria-label="Expand sidebar">
          <ChevronRight size={14} />
        </button>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "0.75rem 0.625rem", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-item${active ? " active" : ""}`}
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{
        padding: "0.875rem 0.625rem",
        borderTop: "1px solid var(--color-surface-100)",
      }}>
        {!collapsed && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.625rem",
            padding: "0.5rem 0.75rem", borderRadius: "10px",
            background: "var(--color-surface-50)",
            marginBottom: "0.5rem",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "white", fontWeight: 600, fontSize: "0.75rem" }}>
                {getInitials(`${profile.first_name} ${profile.last_name}`)}
              </span>
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1c1917",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {profile.first_name} {profile.last_name}
              </p>
              <p style={{ fontSize: "0.7rem", color: "#a8a29e", whiteSpace: "nowrap",
                          overflow: "hidden", textOverflow: "ellipsis" }}>
                Semester {profile.current_semester}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{
            width: "100%", border: "none", background: "none",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "var(--color-error)",
          }}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}