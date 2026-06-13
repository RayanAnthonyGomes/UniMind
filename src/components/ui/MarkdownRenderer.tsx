// src/components/ui/MarkdownRenderer.tsx
"use client";

interface Props {
  content: string;
  prose?:  boolean;
}

export default function MarkdownRenderer({ content, prose = true }: Props) {
  const lines   = content.split("\n");
  const result: React.ReactNode[] = [];
  let   listBuf: { ordered: boolean; items: string[] } | null = null;
  let   codeBuf: string[]  = [];
  let   inCode  = false;
  let   keyIdx  = 0;

  const key = () => `md-${keyIdx++}`;

  function flushList() {
    if (!listBuf) return;
    const { ordered, items } = listBuf;
    if (ordered) {
      result.push(
        <ol key={key()} style={{
          paddingLeft: "1.5rem",
          margin: "0.625rem 0",
          display: "flex", flexDirection: "column", gap: "0.375rem",
        }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text-primary)" }}>
              <InlineFormat text={item} />
            </li>
          ))}
        </ol>
      );
    } else {
      result.push(
        <ul key={key()} style={{
          paddingLeft: "1.5rem",
          margin: "0.625rem 0",
          display: "flex", flexDirection: "column", gap: "0.375rem",
          listStyleType: "disc",
        }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text-primary)" }}>
              <InlineFormat text={item} />
            </li>
          ))}
        </ul>
      );
    }
    listBuf = null;
  }

  function flushCode() {
    if (!codeBuf.length) return;
    result.push(
      <pre key={key()} style={{
        background: "#1e1e2e",
        borderRadius: "10px",
        padding: "1rem 1.25rem",
        overflowX: "auto",
        margin: "0.75rem 0",
        border: "1px solid #2d2d3f",
      }}>
        <code style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.8125rem",
          color: "#cdd6f4",
          lineHeight: 1.65,
          whiteSpace: "pre",
        }}>
          {codeBuf.join("\n")}
        </code>
      </pre>
    );
    codeBuf = [];
  }

  lines.forEach((rawLine) => {
    const line = rawLine;

    // Code fence
    if (line.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      return;
    }
    if (inCode) { codeBuf.push(line); return; }

    const trimmed = line.trim();

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      flushList();
      result.push(
        <hr key={key()} style={{
          border: "none",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          margin: "1rem 0",
        }} />
      );
      return;
    }

    // H1
    if (trimmed.startsWith("# ")) {
      flushList();
      result.push(
        <h2 key={key()} style={{
          fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)",
          marginTop: "1.25rem", marginBottom: "0.375rem",
          paddingBottom: "0.375rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}>
          <InlineFormat text={trimmed.slice(2)} />
        </h2>
      );
      return;
    }

    // H2
    if (trimmed.startsWith("## ")) {
      flushList();
      result.push(
        <h3 key={key()} style={{
          fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)",
          marginTop: "1rem", marginBottom: "0.25rem",
        }}>
          <InlineFormat text={trimmed.slice(3)} />
        </h3>
      );
      return;
    }

    // H3
    if (trimmed.startsWith("### ")) {
      flushList();
      result.push(
        <h4 key={key()} style={{
          fontSize: "0.9375rem", fontWeight: 700,
          color: "var(--color-primary-400)",
          marginTop: "0.875rem", marginBottom: "0.25rem",
        }}>
          <InlineFormat text={trimmed.slice(4)} />
        </h4>
      );
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, "");
      if (listBuf?.ordered) {
        listBuf.items.push(text);
      } else {
        flushList();
        listBuf = { ordered: true, items: [text] };
      }
      return;
    }

    // Unordered list
    if (/^[-*•]\s/.test(trimmed)) {
      const text = trimmed.replace(/^[-*•]\s/, "");
      if (listBuf && !listBuf.ordered) {
        listBuf.items.push(text);
      } else {
        flushList();
        listBuf = { ordered: false, items: [text] };
      }
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList();
      result.push(
        <blockquote key={key()} style={{
          borderLeft: "3px solid var(--color-primary-400)",
          paddingLeft: "1rem",
          margin: "0.625rem 0",
          color: "var(--color-text-secondary)",
          fontStyle: "italic",
          fontSize: "0.9rem",
          background: "rgba(124, 58, 237, 0.05)",
          padding: "0.5rem 1rem",
          borderRadius: "0 8px 8px 0"
        }}>
          <InlineFormat text={trimmed.slice(2)} />
        </blockquote>
      );
      return;
    }

    // Empty line
    if (trimmed === "") {
      flushList();
      result.push(<div key={key()} style={{ height: "0.375rem" }} />);
      return;
    }

    // Regular paragraph
    flushList();
    result.push(
      <p key={key()} style={{
        fontSize: "0.9rem",
        lineHeight: 1.75,
        color: "var(--color-text-secondary)",
        margin: "0.25rem 0",
      }}>
        <InlineFormat text={trimmed} />
      </p>
    );
  });

  flushList();
  flushCode();

  return (
    <div style={{
      maxWidth: prose ? "100%" : undefined,
      display: "flex",
      flexDirection: "column",
      gap: "0.125rem",
    }}>
      {result}
    </div>
  );
}

// ── Inline formatting (bold, italic, code, links) ──────────────────────
function InlineFormat({ text }: { text: string }) {
  // Process: bold (**text**), italic (*text*), inline code (`text`)
  const parts  = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[.+?\]\(.+?\))/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
          return (
            <em key={i} style={{ fontStyle: "italic", color: "var(--color-text-muted)" }}>
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} style={{
              background: "rgba(124, 58, 237, 0.15)",
              color: "var(--color-primary-300)",
              borderRadius: "4px",
              padding: "1px 6px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.8125rem",
              fontWeight: 600,
              border: "1px solid rgba(124, 58, 237, 0.3)"
            }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        // Link [text](url)
        const linkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/);
        if (linkMatch) {
          return (
            <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--color-primary-400)", textDecoration: "underline", textUnderlineOffset: "4px" }}>
              {linkMatch[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}