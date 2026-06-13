// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "UniMind — Your University Life, Organized",
    template: "%s | UNIMIND",
  },
  description:
    "Track courses, grades, assignments and get AI-powered help. Built for university students.",
  keywords: ["university", "student", "academic tracker", "AI assistant", "CGPA"],
  authors: [{ name: "UNIMIND" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#08080c" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(17, 17, 24, 0.9)",
              backdropFilter: "blur(20px)",
              color: "#f0f0f5",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 0 30px -5px rgba(124, 58, 237, 0.15), 0 4px 20px rgba(0,0,0,0.3)",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#34d399", secondary: "#111118" } },
            error:   { iconTheme: { primary: "#f87171", secondary: "#111118" } },
          }}
        />
      </body>
    </html>
  );
}