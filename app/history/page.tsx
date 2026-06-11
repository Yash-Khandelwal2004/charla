"use client";

import { useState, useEffect } from "react";
import { getUserToolUsage, deleteToolUsage } from "@/lib/actions/tools.actions";
import { getUserSessionsWithTranscripts } from "@/lib/actions/companion.actions";
import { useUser } from "@clerk/nextjs";
import { tools } from "@/constants";
import Link from "next/link";
import SessionInsightsView from "@/components/SessionInsights";

type Tab = "tools" | "sessions";
type ToolFilter = "all" | string;

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getToolMeta = (toolName: string) => {
  return (
    tools.find((t) => t.id === toolName) ?? {
      label: toolName,
      icon: "🔧",
      category: "productivity",
      href: "/tools",
      description: "",
    }
  );
};

const HistoryPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("tools");
  const [toolFilter, setToolFilter] = useState<ToolFilter>("all");
  const [toolHistory, setToolHistory] = useState<ToolUsage[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [tools, sessions] = await Promise.all([
          getUserToolUsage(50),
          user ? getUserSessionsWithTranscripts(user.id, 30) : [],
        ]);
        // Dedupe by id in case of duplicate inserts/fetches
        const uniqueTools = Array.from(
          new Map(tools.map((t: any) => [t.id, t])).values(),
        );
        const uniqueSessions = Array.from(
          new Map(sessions.map((s: any) => [s.id, s])).values(),
        );

        setToolHistory(uniqueTools as ToolUsage[]);
        setSessionHistory(uniqueSessions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  const handleDeleteTool = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteToolUsage(id);
      setToolHistory((prev) => prev.filter((t) => t.id !== id));
      if (expandedTool === id) setExpandedTool(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTools =
    toolFilter === "all"
      ? toolHistory
      : toolHistory.filter((t) => t.tool_name === toolFilter);

  const uniqueToolNames = [...new Set(toolHistory.map((t) => t.tool_name))];

  // Render markdown-like output simply
  const renderOutput = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ") || line.startsWith("## ")) {
        return (
          <p
            key={i}
            className="font-semibold text-sm mt-4 mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {line.replace(/^#{2,3}\s/, "")}
          </p>
        );
      }
      if (/^\d+\.\s\*\*(.+)\*\*/.test(line)) {
        return (
          <p
            key={i}
            className="font-semibold text-sm mt-3"
            style={{ color: "var(--text-primary)" }}
          >
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <p
            key={i}
            className="text-sm ml-4"
            style={{ color: "var(--text-secondary)" }}
          >
            • {line.replace(/^[-•]\s/, "").replace(/\*\*(.+?)\*\*/g, "$1")}
          </p>
        );
      }
      if (line.includes("**")) {
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <p
            key={i}
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} style={{ color: "var(--text-primary)" }}>
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
        );
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return (
        <p
          key={i}
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {line}
        </p>
      );
    });
  };

  return (
    <main>
      {/* Page header */}
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-sm">
          All your tool runs and companion conversations in one place.
        </p>
      </section>

      <div className="divider" />

      {/* Tab nav */}
      <div
        className="flex gap-0 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        {(["tools", "sessions"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium capitalize transition-all duration-150 relative cursor-pointer"
            style={{
              color:
                activeTab === tab
                  ? "var(--text-primary)"
                  : "var(--text-tertiary)",
              borderBottom:
                activeTab === tab
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
            }}
          >
            {tab === "tools"
              ? `Tool History (${toolHistory.length})`
              : `Conversations (${sessionHistory.length})`}
          </button>
        ))}
      </div>

      {/* Tool History Tab */}
      {activeTab === "tools" && (
        <div className="flex flex-col gap-4">
          {/* Filter by tool */}
          {uniqueToolNames.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setToolFilter("all")}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
                style={{
                  backgroundColor:
                    toolFilter === "all"
                      ? "var(--accent-muted)"
                      : "var(--bg-subtle)",
                  color:
                    toolFilter === "all"
                      ? "var(--accent)"
                      : "var(--text-tertiary)",
                  border: `1px solid ${toolFilter === "all" ? "var(--accent)" : "var(--border-default)"}`,
                }}
              >
                All
              </button>
              {uniqueToolNames.map((name) => {
                const meta = getToolMeta(name);
                return (
                  <button
                    key={name}
                    onClick={() => setToolFilter(name)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
                    style={{
                      backgroundColor:
                        toolFilter === name
                          ? "var(--accent-muted)"
                          : "var(--bg-subtle)",
                      color:
                        toolFilter === name
                          ? "var(--accent)"
                          : "var(--text-tertiary)",
                      border: `1px solid ${toolFilter === name ? "var(--accent)" : "var(--border-default)"}`,
                    }}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 animate-pulse"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--border-default)",
                    height: "80px",
                  }}
                />
              ))}
            </div>
          ) : filteredTools.length === 0 ? (
            <div
              className="rounded-xl p-10 flex flex-col items-center gap-3"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px dashed var(--border-default)",
              }}
            >
              <span className="text-4xl">🔧</span>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                No tool history yet.{" "}
                <Link href="/tools" style={{ color: "var(--accent)" }}>
                  Browse tools →
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredTools.map((usage) => {
                const meta = getToolMeta(usage.tool_name);
                const isExpanded = expandedTool === usage.id;

                return (
                  <div
                    key={usage.id}
                    className="rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: `1px solid ${isExpanded ? "var(--border-strong)" : "var(--border-default)"}`,
                    }}
                  >
                    {/* Row header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer"
                      onClick={() =>
                        setExpandedTool(isExpanded ? null : usage.id)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xl w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ backgroundColor: "var(--bg-overlay)" }}
                        >
                          {meta.icon}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {meta.label}
                          </p>
                          <p
                            className="text-xs line-clamp-1 max-w-[400px]"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {usage.output.slice(0, 80)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {formatDate(usage.created_at)}
                        </span>
                        <Link
                          href={meta.href}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs px-2.5 py-1 rounded-lg transition-colors duration-150"
                          style={{
                            backgroundColor: "var(--accent-muted)",
                            color: "var(--accent)",
                          }}
                        >
                          Use again
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTool(usage.id);
                          }}
                          disabled={deletingId === usage.id}
                          className="text-xs px-2 py-1 rounded-lg transition-colors duration-150 cursor-pointer"
                          style={{
                            color: "var(--color-danger)",
                            opacity: deletingId === usage.id ? 0.5 : 1,
                          }}
                        >
                          {deletingId === usage.id ? "..." : "Delete"}
                        </button>
                        <span
                          className="text-xs transition-transform duration-200"
                          style={{
                            color: "var(--text-tertiary)",
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            display: "inline-block",
                          }}
                        >
                          ▾
                        </span>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div
                        className="px-4 pb-4 pt-2 border-t"
                        style={{ borderColor: "var(--border-default)" }}
                      >
                        {/* Input section */}
                        <div className="mb-4">
                          <p
                            className="text-xs font-medium uppercase tracking-wide mb-2"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            Your Input
                          </p>
                          <div
                            className="rounded-lg p-3 text-xs font-mono"
                            style={{
                              backgroundColor: "var(--bg-overlay)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-default)",
                            }}
                          >
                            {Object.entries(usage.input).map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span style={{ color: "var(--text-tertiary)" }}>
                                  {key}:{" "}
                                </span>
                                <span>
                                  {String(value).slice(0, 200)}
                                  {String(value).length > 200 ? "..." : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Output section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p
                              className="text-xs font-medium uppercase tracking-wide"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              Result
                            </p>
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(usage.output)
                              }
                              className="text-xs px-2 py-1 rounded transition-colors cursor-pointer"
                              style={{
                                color: "var(--text-tertiary)",
                                backgroundColor: "var(--bg-subtle)",
                              }}
                            >
                              Copy
                            </button>
                          </div>
                          <div
                            className="rounded-lg p-4 flex flex-col gap-1 max-h-96 overflow-y-auto"
                            style={{
                              backgroundColor: "var(--bg-overlay)",
                              border: "1px solid var(--border-default)",
                            }}
                          >
                            {renderOutput(usage.output)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Session History Tab */}
      {activeTab === "sessions" && (
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 animate-pulse"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--border-default)",
                    height: "80px",
                  }}
                />
              ))}
            </div>
          ) : sessionHistory.length === 0 ? (
            <div
              className="rounded-xl p-10 flex flex-col items-center gap-3"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px dashed var(--border-default)",
              }}
            >
              <span className="text-4xl">🎓</span>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                No sessions yet.{" "}
                <Link href="/companions" style={{ color: "var(--accent)" }}>
                  Start a session →
                </Link>
              </p>
            </div>
          ) : (
            sessionHistory.map((session: any) => {
              const companion = session.companions;
              const transcript: SavedMessage[] = session.transcript || [];
              const insights: SessionInsights | null = session.insights ?? null;
              const isExpanded = expandedSession === session.id;

              return (
                <div
                  key={session.id}
                  className="rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    border: `1px solid ${isExpanded ? "var(--border-strong)" : "var(--border-default)"}`,
                  }}
                >
                  {/* Row header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() =>
                      setExpandedSession(isExpanded ? null : session.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-base flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-overlay)" }}
                      >
                        🎓
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {companion?.name || "Companion Session"}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {companion?.subject} · {companion?.topic} ·{" "}
                          {transcript.length} messages
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {formatDate(session.created_at)}
                      </span>
                      {companion && (
                        <Link
                          href={`/companions/${companion.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs px-2.5 py-1 rounded-lg"
                          style={{
                            backgroundColor: "var(--accent-muted)",
                            color: "var(--accent)",
                          }}
                        >
                          Resume
                        </Link>
                      )}
                      <span
                        className="text-xs transition-transform duration-200"
                        style={{
                          color: "var(--text-tertiary)",
                          transform: isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          display: "inline-block",
                        }}
                      >
                        ▾
                      </span>
                    </div>
                  </div>
                  {/* Expanded content */}

                  {isExpanded && (
                    <div
                      className="px-4 pb-5 pt-4 border-t"
                      style={{
                        borderColor: "var(--border-default)",
                        backgroundColor: "var(--bg-base)",
                      }}
                    >
                      {/* Insights section */}
                      {insights ? (
                        <SessionInsightsView insights={insights} />
                      ) : (
                        <div
                          className="rounded-lg p-3 text-xs flex items-center gap-2 mb-4"
                          style={{
                            backgroundColor: "var(--bg-overlay)",
                            color: "var(--text-tertiary)",
                            border: "1px solid var(--border-default)",
                          }}
                        >
                          <span>⏳</span>
                          {transcript.length === 0
                            ? "No insights available — session has no transcript."
                            : "Insights are still being generated for this session. Refresh in a moment."}
                        </div>
                      )}

                      {/* Transcript section */}
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{ border: "1px solid var(--border-default)" }}
                      >
                        <div
                          className="px-3 py-2.5 flex items-center gap-2"
                          style={{
                            backgroundColor: "var(--bg-overlay)",
                            borderBottom: "1px solid var(--border-default)",
                          }}
                        >
                          <span
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{
                              color: "var(--text-tertiary)",
                              letterSpacing: "0.04em",
                            }}
                          >
                            💬 Conversation Transcript
                          </span>
                          <span
                            className="text-xs ml-auto px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "var(--bg-subtle)",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {transcript.length} messages
                          </span>
                        </div>

                        {transcript.length === 0 ? (
                          <p
                            className="text-sm p-4"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            No transcript recorded for this session.
                          </p>
                        ) : (
                          <div
                            className="flex flex-col gap-2 max-h-96 overflow-y-auto p-3"
                            style={{ backgroundColor: "var(--bg-raised)" }}
                          >
                            {[...transcript].reverse().map((message, idx) => (
                              <div
                                key={idx}
                                className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                              >
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                                  style={{
                                    backgroundColor: "var(--bg-overlay)",
                                    border: "1px solid var(--border-default)",
                                  }}
                                >
                                  {message.role === "user" ? "👤" : "🤖"}
                                </div>
                                <div
                                  className="rounded-xl px-3 py-2 text-sm max-w-[80%]"
                                  style={{
                                    backgroundColor:
                                      message.role === "user"
                                        ? "var(--accent-muted)"
                                        : "var(--bg-overlay)",
                                    color: "var(--text-primary)",
                                    border: "1px solid var(--border-default)",
                                  }}
                                >
                                  {message.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </main>
  );
};

export default HistoryPage;
