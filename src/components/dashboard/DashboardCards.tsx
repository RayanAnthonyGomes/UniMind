// src/components/dashboard/DashboardCards.tsx
interface Card {
  label: string;
  value: string | number;
  icon:  React.ReactNode;
  color: string;
  bg:    string;
  sub:   string;
}

export default function DashboardCards({ cards }: { cards: Card[] }) {
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
              flexShrink: 0,
            }}>
              {card.icon}
            </div>
          </div>

          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#1c1917",
                      lineHeight: 1, marginBottom: "0.375rem" }}>
            {card.value}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#44403c",
                      marginBottom: "0.25rem" }}>
            {card.label}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}