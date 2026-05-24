// // src/app/(auth)/layout.tsx
// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "1.5rem",
//         background: "var(--color-surface-50)",
//         backgroundImage: `
//           radial-gradient(ellipse at 20% 50%, rgb(99 102 241 / 0.05) 0%, transparent 60%),
//           radial-gradient(ellipse at 80% 20%, rgb(245 158 11 / 0.04) 0%, transparent 60%)
//         `,
//       }}
//     >
//       {/* Logo top-left on desktop */}
//       <div style={{ position: "fixed", top: "1.5rem", left: "1.5rem" }}>
        
//           href="/"
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "0.5rem",
//             textDecoration: "none",
//           }}
//         >
//           <div
//             style={{
//               width: "32px",
//               height: "32px",
//               borderRadius: "10px",
//               background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>U</span>
//           </div>
//           <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1c1917" }}>
//             UNI<span style={{ color: "var(--color-primary-600)" }}>MIND</span>
//           </span>
//         </a>
//       </div>

//       {children}
//     </div>
//   );
// }


//PREVIOUSLY // src/app/(auth)/layout.tsx  had  many errors due to missing imports and incorrect JSX syntax. Below is the corrected version of the code:

// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--color-surface-50)",
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgb(99 102 241 / 0.05) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgb(245 158 11 / 0.04) 0%, transparent 60%)
        `,
      }}
    >
      {/* Logo top-left on desktop */}
      <div style={{ position: "fixed", top: "1.5rem", left: "1.5rem" }}>
        
        {/* We added the missing `<a` right here! */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>U</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1c1917" }}>
            UNI<span style={{ color: "var(--color-primary-600)" }}>MIND</span>
          </span>
        </a>
      </div>

      {children}
    </div>
  );
}