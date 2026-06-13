// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export const metadata = { title: "layout" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "var(--color-surface-0)",
      position: "relative",
    }}>
      {/* Subtle ambient gradient behind content */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(124, 58, 237, 0.03) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(99, 102, 241, 0.02) 0%, transparent 50%)
        `,
      }} />

      <Sidebar profile={profile} />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        position: "relative",
        zIndex: 1,
      }}>
        <TopBar profile={profile} />
        <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto" }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}