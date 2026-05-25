// src/components/grades/GradesOverview.tsx
import { TrendingUp, Award, BookOpen, Target } from "lucide-react";
import type { User } from "@/types";

interface SemesterGpa {
  semester: number;
  sgpa:     number;
}

export default function GradesOverview({
  profile, semesterGpas, courseCount,
}: {
  profile:      User;
  semesterGpas: SemesterGpa[];
  courseCount:  number;
}) {
  const cgpa        = profile.current_cgpa ?? 0;
  const latestSGPA  = semesterGpas.at(-1)?.sgpa ?? 0;
  const bestSGPA    = semesterGpas.length
    ? Math.max(...semesterGpas.map((s) => s.sgpa))
    : 0;

  function cgpaColor(val: number) {
    if (val >= 3.5) return "#22c55e";
    if (val >= 3.0) return "#f59e0b";
    if (val >= 2.5) return "#f97316";
    return "#ef4444";
  }

  const cards = [
    {
      label:    "Current CGPA",
      value:    cgpa.toFixed(2),
      sub:      `Out of 4.00`,
      icon:     <TrendingUp size={20} />,
      color:    cgpaColor(cgpa),
      bg:       "#f0fdf4",
      progress: (cgpa / 4) * 100,
    },
    {
      label:    "Latest SGPA",
      value:    latestSGPA > 0 ? latestSGPA.toFixed(2) : "—",
      sub:      latestSGPA > 0 ? `Semester ${semesterGpas.at(-1)?.semester}` : "No data yet",
      icon:     <Award size={20} />,
      color:    cgpaColor(latestSGPA),
      bg:       "#fffbeb",
      progress: (latestSGPA / 4) * 100,
    },
    {
      label:    "Best SGPA",
      value:    bestSGPA > 0 ? bestSGPA.toFixed(2) : "—",
      sub:      "All time high",
      icon:     <Target size={20} />,
      color:    "#6366f1",
      bg:       "var(--color-primary-50)",
      progress: (bestSGPA / 4) * 100,
    },
    {
      label:    "Semesters Tracked",
      value:    semesterGpas.length,
      sub:      `${courseCount} active courses`,
      icon:     <BookOpen size={20} />,
      color:    "#0ea5e9",
      bg:       "#f0f9ff",
      progress: null,
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.25rem",
    }}>
      {cards.map((card) => (
        <div key={card.label} className="clay-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: card.bg, color: card.color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {card.icon}
            </div>
          </div>

          <p style={{ fontSize: "2rem", fontWeight: 700, color: card.color, lineHeight: 1, marginBottom: "0.375rem" }}>
            {card.value}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#44403c", marginBottom: "0.25rem" }}>
            {card.label}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#a8a29e", marginBottom: card.progress !== null ? "0.875rem" : 0 }}>
            {card.sub}
          </p>

          {card.progress !== null && card.progress > 0 && (
            <div style={{ height: "6px", background: "var(--color-surface-200)", borderRadius: "999px" }}>
              <div style={{
                height: "100%", borderRadius: "999px",
                background: card.color,
                width: `${Math.min(card.progress, 100)}%`,
                transition: "width 0.6s ease",
              }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}