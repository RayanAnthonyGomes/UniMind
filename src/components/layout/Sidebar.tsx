// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, BarChart2, CheckSquare,
  Bot, PenTool, Sparkles, LogOut,
  ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/courses",       icon: BookOpen,         label: "Courses"       },
  { href: "/grades",        icon: BarChart2,        label: "Grades"        },
  { href: "/tasks",         icon: CheckSquare,      label: "Tasks"         },
  { href: "/ai-assistant",  icon: Bot,              label: "AI Assistant"  },
  { href: "/drawing-board", icon: PenTool,          label: "Drawing Board" },
  { href: "/motivation",    icon: Sparkles,         label: "Motivation"    },
];

export default function Sidebar({ profile }: { profile: User }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo row */}
      <div style={{
        padding: "1.25rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: (collapsed && !isMobile) ? "center" : "space-between",
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
        minHeight: "64px",
      }}>
        {(!collapsed || isMobile) && (
          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: "0 0 20px -3px rgba(124, 58, 237, 0.4)",
            }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-display)" }}>U</span>
            </div>
            <span style={{
              fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)",
              whiteSpace: "nowrap", fontFamily: "var(--font-display)",
            }}>
              UNI<span className="text-gradient">MIND</span>
            </span>
          </Link>
        )}

        {collapsed && !isMobile && (
          <div style={{
            width: "32px", height: "32px", borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px -3px rgba(124, 58, 237, 0.4)",
          }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-display)" }}>U</span>
          </div>
        )}

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: "5px",
              display: "flex",
              transition: "all 0.2s",
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {isMobile && (
          <button onClick={() => setMobileOpen(false)}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: "5px",
              display: "flex",
            }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: "0.75rem 0.5rem",
        display: "flex", flexDirection: "column", gap: "2px",
      }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "10px",
                color: active ? "var(--color-primary-300)" : "var(--color-text-muted)",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                textDecoration: "none",
                position: "relative",
                justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
                background: active ? "rgba(124, 58, 237, 0.10)" : "transparent",
              }}
              title={(collapsed && !isMobile) ? label : undefined}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "55%",
                    background: "var(--color-primary-500)",
                    borderRadius: "0 4px 4px 0",
                    boxShadow: "0 0 12px rgba(124, 58, 237, 0.6)",
                  }}
                />
              )}
              <Icon size={18} style={{
                flexShrink: 0,
                filter: active ? "drop-shadow(0 0 6px rgba(124, 58, 237, 0.4))" : "none",
                transition: "filter 0.2s",
              }} />
              {(!collapsed || isMobile) && (
                <span style={{ whiteSpace: "nowrap" }}>{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: "0.75rem 0.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
        {(!collapsed || isMobile) && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.625rem",
            padding: "0.625rem 0.75rem", borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            marginBottom: "0.5rem",
          }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 15px -3px rgba(124, 58, 237, 0.3)",
            }}>
              <span style={{ color: "white", fontWeight: 600, fontSize: "0.75rem" }}>
                {getInitials(`${profile.first_name} ${profile.last_name}`)}
              </span>
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{
                fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {profile.first_name} {profile.last_name}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                Semester {profile.current_semester}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.625rem 0.75rem",
            borderRadius: "10px",
            width: "100%",
            border: "none",
            background: "none",
            justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
            color: "var(--color-error)",
            fontWeight: 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          title={(collapsed && !isMobile) ? "Sign out" : undefined}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {(!collapsed || isMobile) && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE HAMBURGER BUTTON ────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          display: "none",
          position: "fixed", top: "14px", left: "1rem",
          zIndex: 60,
          background: "rgba(17, 17, 24, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "10px",
          padding: "8px", cursor: "pointer",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        }}
        className="mobile-menu-btn"
        aria-label="Open menu"
      >
        <Menu size={20} style={{ color: "var(--color-text-secondary)" }} />
      </button>

      {/* ── MOBILE OVERLAY ────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{
              display: "none",
              position: "fixed", inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 49,
            }}
            className="mobile-overlay"
          />
        )}
      </AnimatePresence>

      {/* ── MOBILE DRAWER ─────────────────────────────────── */}
      <aside
        className="mobile-drawer"
        style={{
          display: "none",
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: "260px", zIndex: 50,
          background: "var(--color-surface-50)",
          borderRight: "1px solid rgba(255, 255, 255, 0.04)",
          flexDirection: "column",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: mobileOpen ? "4px 0 40px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <NavContent isMobile />
      </aside>

      {/* ── DESKTOP SIDEBAR ───────────────────────────────── */}
      <aside
        className="desktop-sidebar"
        style={{
          width: collapsed ? "72px" : "240px",
          minWidth: collapsed ? "72px" : "240px",
          height: "100vh",
          position: "sticky", top: 0,
          background: "var(--color-surface-50)",
          borderRight: "1px solid rgba(255, 255, 255, 0.04)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        <NavContent />
      </aside>
    </>
  );
}