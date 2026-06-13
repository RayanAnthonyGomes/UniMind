// src/components/grades/SemesterGPAChart.tsx
"use client";

interface SemesterGpa {
  semester: number;
  sgpa:     number;
}

export default function SemesterGPAChart({ semesterGpas }: { semesterGpas: SemesterGpa[] }) {
  const max   = 4;
  const maxH  = 140;

  function barColor(sgpa: number) {
    if (sgpa >= 3.5) return "#34d399";
    if (sgpa >= 3.0) return "#818cf8";
    if (sgpa >= 2.5) return "#fbbf24";
    return "#f87171";
  }

  return (
    <div className="glass-card-static" style={{ padding: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem", fontFamily: "var(--font-display)" }}>
            SGPA Trend
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Your performance across semesters</p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {[
            { color: "#34d399", label: "≥ 3.5" },
            { color: "#818cf8", label: "≥ 3.0" },
            { color: "#fbbf24", label: "≥ 2.5" },
            { color: "#f87171", label: "< 2.5" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: l.color }} />
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.875rem", height: `${maxH + 40}px` }}>

        {/* Y axis */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          height: `${maxH}px`, paddingBottom: "2px",
        }}>
          {[4, 3, 2, 1, 0].map((v) => (
            <span key={v} style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textAlign: "right" }}>
              {v}.0
            </span>
          ))}
        </div>

        {/* Bars */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "0.75rem", height: `${maxH + 40}px` }}>
          {semesterGpas.map((s) => {
            const barH = Math.max((s.sgpa / max) * maxH, 8);
            const color = barColor(s.sgpa);
            return (
              <div key={s.semester}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "0.5rem", height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                {/* Value label */}
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-primary)", opacity: 0.9 }}>
                  {s.sgpa.toFixed(2)}
                </span>

                {/* Bar */}
                <div style={{
                  width: "100%", height: `${barH}px`,
                  background: `linear-gradient(180deg, ${color}, ${color}aa)`,
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.5s ease",
                  minWidth: "28px",
                  position: "relative",
                  cursor: "default",
                  boxShadow: `0 -5px 15px -5px ${color}40`,
                }}
                  title={`Semester ${s.semester}: ${s.sgpa.toFixed(2)}`}
                />

                {/* Semester label */}
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  Sem {s.semester}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Horizontal rule at 2.0 (pass mark) */}
      <div style={{
        marginTop: "1.25rem", padding: "0.625rem 0.875rem",
        background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px",
        display: "flex", alignItems: "center", gap: "0.5rem",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <div style={{ width: "24px", height: "3px", background: "#f87171", borderRadius: "2px", boxShadow: "0 0 6px #f8717160" }} />
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
          2.00 — minimum passing CGPA at most universities
        </span>
      </div>
    </div>
  );
}