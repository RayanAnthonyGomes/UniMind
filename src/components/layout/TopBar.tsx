// src/components/layout/TopBar.tsx
"use client";

import { Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

export default function TopBar({ profile }: { profile: User }) {
  return (
    <header style={{
      height: "64px",
      borderBottom: "1px solid var(--color-surface-200)",
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 2rem",
      gap: "1rem",
      position: "sticky",
      top: 0,
      zIndex: 9,
    }}>
      {/* Notification bell */}
      <button style={{
        position: "relative", background: "var(--color-surface-100)",
        border: "1px solid var(--color-surface-200)", borderRadius: "10px",
        padding: "0.5rem", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
        aria-label="Notifications">
        <Bell size={18} style={{ color: "#57534e" }} />
        {/* Red dot */}
        <span style={{
          position: "absolute", top: "6px", right: "6px",
          width: "8px", height: "8px", borderRadius: "50%",
          background: "var(--color-error)",
          border: "2px solid white",
        }} />
      </button>

      {/* Avatar */}
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}>
        <span style={{ color: "white", fontWeight: 600, fontSize: "0.8125rem" }}>
          {getInitials(`${profile.first_name} ${profile.last_name}`)}
        </span>
      </div>
    </header>
  );
}