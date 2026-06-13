// src/components/layout/TopBar.tsx
import NotificationBell from "./NotificationBell";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

export default function TopBar({ profile }: { profile: User }) {
  return (
    <header style={{
      height: "64px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
      background: "rgba(8, 8, 12, 0.6)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 2rem",
      gap: "0.875rem",
      position: "sticky",
      top: 0,
      zIndex: 9,
    }}>
      {/* Gradient bottom border line */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.15), rgba(99, 102, 241, 0.1), transparent)",
      }} />

      {/* Notification bell */}
      <NotificationBell userId={profile.id} />

      {/* Avatar */}
      <div style={{
        position: "relative",
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        cursor: "pointer",
        flexShrink: 0,
      }}>
        {/* Gradient ring */}
        <div style={{
          position: "absolute",
          inset: "-2px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #6366f1, #818cf8)",
          opacity: 0.7,
        }} />
        {/* Inner circle */}
        <div style={{
          position: "absolute",
          inset: "1px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ color: "white", fontWeight: 600, fontSize: "0.8125rem" }}>
            {getInitials(`${profile.first_name} ${profile.last_name}`)}
          </span>
        </div>
      </div>
    </header>
  );
}