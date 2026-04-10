"use client";
import { useState } from "react";

interface ToolOutputProps {
  output: string;
  toolName: string;
}

const ToolOutput = ({ output, toolName }: ToolOutputProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-like renderer
  const renderOutput = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        // H2 bold headers like **Title**
        if (line.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="text-lg font-bold mt-6 mb-2"
              style={{ color: "var(--foreground)", fontFamily: "var(--font-bricolage)" }}
            >
              {line.replace("## ", "")}
            </h2>
          );
        }
        // Bold numbered sections like 1. **Title**
        if (/^\d+\.\s\*\*(.+)\*\*/.test(line)) {
          const match = line.match(/^(\d+\.\s)\*\*(.+)\*\*/);
          if (match) {
            return (
              <p key={i} className="font-bold mt-4 mb-1" style={{ color: "var(--foreground)" }}>
                {match[1]}{match[2]}
              </p>
            );
          }
        }
        // Bullet points
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <li
              key={i}
              className="ml-4 text-sm leading-relaxed list-disc"
              style={{ color: "var(--muted-foreground)" }}
            >
              {line.replace(/^[-•]\s/, "").replace(/\*\*(.+?)\*\*/g, "$1")}
            </li>
          );
        }
        // Bold inline text
        if (line.includes("**")) {
          const parts = line.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {parts.map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} style={{ color: "var(--foreground)" }}>
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        }
        // Empty line
        if (line.trim() === "") return <div key={i} className="h-2" />;
        // Regular text
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {line}
          </p>
        );
      });
  };

  return (
    <div
      className="rounded-lg p-6 flex flex-col gap-4"
      style={{
        backgroundColor: "var(--surface-1)",
        border: "1px solid var(--surface-3)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
          />
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Result
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 rounded-md cursor-pointer"
          style={{
            backgroundColor: copied ? "var(--accent-muted)" : "var(--surface-2)",
            color: copied ? "var(--accent)" : "var(--muted-foreground)",
            border: "1px solid var(--surface-3)",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Output content */}
      <div className="flex flex-col gap-1 max-h-[600px] overflow-y-auto pr-2">
        {renderOutput(output)}
      </div>
    </div>
  );
};

export default ToolOutput;