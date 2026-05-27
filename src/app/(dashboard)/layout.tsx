// // src/app/(dashboard)/layout.tsx
// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import Sidebar from "@/components/layout/Sidebar";
// import TopBar from "@/components/layout/TopBar";

// export default async function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // Auth protection — Next.js 16 style, in layout not proxy
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();

//   if (!user) redirect("/login");

//   // Fetch profile
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", user.id)
//     .single();

//   if (!profile) redirect("/login");

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-surface-50)" }}>
//       {/* Sidebar */}
//       <Sidebar profile={profile} />

//       {/* Main content */}
//       <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
//         <TopBar profile={profile} />
//         <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto" }}>
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-surface-50)" }}>
      <Sidebar profile={profile} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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