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
    if (val >= 3.5) return "#34d399";
    if (val >= 3.0) return "#fbbf24";
    if (val >= 2.5) return "#fb923c";
    return "#f87171";
  }

  const cards = [
    {
      label:    "Current CGPA",
      value:    cgpa.toFixed(2),
      sub:      `Out of 4.00`,
      icon:     <TrendingUp size={20} />,
      color:    cgpaColor(cgpa),
      bg:       `rgba(${cgpa >= 3.5 ? '52,211,153' : cgpa >= 3.0 ? '251,191,36' : cgpa >= 2.5 ? '251,146,60' : '248,113,113'}, 0.12)`,
      progress: (cgpa / 4) * 100,
    },
    {
      label:    "Latest SGPA",
      value:    latestSGPA > 0 ? latestSGPA.toFixed(2) : "—",
      sub:      latestSGPA > 0 ? `Semester ${semesterGpas.at(-1)?.semester}` : "No data yet",
      icon:     <Award size={20} />,
      color:    cgpaColor(latestSGPA),
      bg:       `rgba(${latestSGPA >= 3.5 ? '52,211,153' : latestSGPA >= 3.0 ? '251,191,36' : latestSGPA >= 2.5 ? '251,146,60' : '248,113,113'}, 0.12)`,
      progress: (latestSGPA / 4) * 100,
    },
    {
      label:    "Best SGPA",
      value:    bestSGPA > 0 ? bestSGPA.toFixed(2) : "—",
      sub:      "All time high",
      icon:     <Target size={20} />,
      color:    "#818cf8",
      bg:       "rgba(129, 140, 248, 0.12)",
      progress: (bestSGPA / 4) * 100,
    },
    {
      label:    "Semesters Tracked",
      value:    semesterGpas.length,
      sub:      `${courseCount} active courses`,
      icon:     <BookOpen size={20} />,
      color:    "#38bdf8",
      bg:       "rgba(56, 189, 248, 0.12)",
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
        <div key={card.label} className="glass-card-static" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: card.bg, color: card.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 20px -5px ${card.color}40`,
            }}>
              {card.icon}
            </div>
          </div>

          <p style={{
            fontSize: "2rem", fontWeight: 700, color: "var(--color-text-primary)",
            lineHeight: 1, marginBottom: "0.375rem", fontFamily: "var(--font-display)"
          }}>
            {card.value}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
            {card.label}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: card.progress !== null ? "0.875rem" : 0 }}>
            {card.sub}
          </p>

          {card.progress !== null && card.progress > 0 && (
            <div style={{ height: "4px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "999px",
                background: card.color,
                width: `${Math.min(card.progress, 100)}%`,
                transition: "width 0.6s ease",
                boxShadow: `0 0 10px ${card.color}60`,
              }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}