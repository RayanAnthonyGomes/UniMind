// // src/components/dashboard/DashboardCards.tsx
// interface Card {
//   label: string;
//   value: string | number;
//   icon:  React.ReactNode;
//   color: string;
//   bg:    string;
//   sub:   string;
// }

// export default function DashboardCards({ cards }: { cards: Card[] }) {
//   return (
//     <div style={{
//       display: "grid",
//       gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//       gap: "1.25rem",
//     }}>
//       {cards.map((card) => (
//         <div key={card.label} className="clay-card" style={{ padding: "1.5rem" }}>
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
//             <div style={{
//               width: "40px", height: "40px", borderRadius: "10px",
//               background: card.bg, color: card.color,
//               display: "flex", alignItems: "center", justifyContent: "center",
//               flexShrink: 0,
//             }}>
//               {card.icon}
//             </div>
//           </div>

//           <p style={{ fontSize: "2rem", fontWeight: 700, color: "#1c1917",
//                       lineHeight: 1, marginBottom: "0.375rem" }}>
//             {card.value}
//           </p>
//           <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#44403c",
//                       marginBottom: "0.25rem" }}>
//             {card.label}
//           </p>
//           <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
//             {card.sub}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }

// src/components/dashboard/DashboardCards.tsx
import Link from "next/link";

interface Card {
  label:   string;
  value:   string | number;
  icon:    React.ReactNode;
  color:   string;
  bg:      string;
  sub:     string;
  href?:   string;
}

export default function DashboardCards({ cards }: { cards: Card[] }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.25rem",
    }}>
      {cards.map((card) => {
        const inner = (
          <div className="clay-card" style={{
            padding: "1.5rem",
            cursor: card.href ? "pointer" : "default",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: card.bg, color: card.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1rem",
            }}>
              {card.icon}
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
        );

        return card.href ? (
          <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
            {inner}
          </Link>
        ) : (
          <div key={card.label}>{inner}</div>
        );
      })}
    </div>
  );
}