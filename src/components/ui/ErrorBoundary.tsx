// src/components/ui/ErrorBoundary.tsx
"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props   { children: ReactNode; fallback?: ReactNode; }
interface State   { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "3rem 2rem",
          textAlign: "center",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1rem",
          }}>
            <AlertTriangle size={24} style={{ color: "var(--color-error)" }} />
          </div>
          <h3 style={{ fontWeight: 700, color: "#1c1917", marginBottom: "0.5rem" }}>
            Something went wrong
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#78716c", marginBottom: "1.5rem", maxWidth: "320px" }}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}