"use client";

import { useState } from "react";

const SessionInsightsView = ({ insights }: { insights: SessionInsights }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex: number, option: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const score = insights.quiz.filter(
    (q, i) => selectedAnswers[i] === q.correct_answer
  ).length;

  const sectionCard = {
    backgroundColor: "var(--bg-overlay)",
    border: "1px solid var(--border-default)",
    borderRadius: "10px",
    padding: "14px 16px",
  };

  const sectionLabel = {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    color: "var(--text-tertiary)",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  return (
    <div className="flex flex-col gap-4 mb-5">

      {/* Insights header */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md"
          style={{
            backgroundColor: "var(--accent-muted)",
            color: "var(--accent)",
            letterSpacing: "0.05em",
          }}
        >
          ✨ AI Session Insights
        </span>
      </div>

      {/* Summary */}
      <div style={sectionCard}>
        <p style={sectionLabel}>📋 Session Summary</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {insights.summary}
        </p>
      </div>

      {/* Struggled with */}
      {insights.struggled_with?.length > 0 && (
        <div style={sectionCard}>
          <p style={sectionLabel}>⚠️ Areas to Review</p>
          <div className="flex flex-wrap gap-2">
            {insights.struggled_with.map((item, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1.5 rounded-full font-medium"
                style={{
                  backgroundColor: "rgba(245,166,35,0.10)",
                  color: "var(--color-warning)",
                  border: "1px solid rgba(245,166,35,0.25)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next topic */}
      <div style={sectionCard}>
        <p style={sectionLabel}>🎯 Recommended Next</p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-primary)" }}
        >
          {insights.next_topic}
        </p>
      </div>

      {/* Quiz */}
      <div style={sectionCard}>
        <div className="flex items-center justify-between mb-3">
          <p style={{ ...sectionLabel, marginBottom: 0 }}>🧠 Quick Quiz</p>
          {submitted && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: score >= insights.quiz.length / 2
                  ? "rgba(62,207,142,0.12)"
                  : "rgba(240,68,68,0.12)",
                color: score >= insights.quiz.length / 2
                  ? "var(--color-success)"
                  : "var(--color-danger)",
              }}
            >
              {score} / {insights.quiz.length} correct
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {insights.quiz.map((q, qIndex) => {
            const selected = selectedAnswers[qIndex];
            const options: string[] = Array.isArray(q.options)
              ? q.options
              : String(q.options).split(/,|\n/).map((o) => o.trim()).filter(Boolean);

            return (
              <div
                key={qIndex}
                className="rounded-lg p-3.5"
                style={{
                  backgroundColor: "var(--bg-raised)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <p className="text-sm font-semibold mb-3 leading-snug" style={{ color: "var(--text-primary)" }}>
                  <span style={{ color: "var(--accent)" }}>{qIndex + 1}.</span> {q.question}
                </p>
                <div className="flex flex-col gap-2">
                  {options.map((option, oIndex) => {
                    const isSelected = selected === option;
                    const isCorrect = option === q.correct_answer;
                    let bg = "var(--bg-overlay)";
                    let border = "var(--border-default)";
                    let color = "var(--text-secondary)";
                    let prefix = String.fromCharCode(65 + oIndex); // A, B, C, D

                    if (submitted) {
                      if (isCorrect) {
                        bg = "rgba(62,207,142,0.10)";
                        border = "var(--color-success)";
                        color = "var(--color-success)";
                      } else if (isSelected && !isCorrect) {
                        bg = "rgba(240,68,68,0.10)";
                        border = "var(--color-danger)";
                        color = "var(--color-danger)";
                      }
                    } else if (isSelected) {
                      bg = "var(--accent-muted)";
                      border = "var(--accent)";
                      color = "var(--text-primary)";
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelect(qIndex, option)}
                        disabled={submitted}
                        className="text-left text-sm px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2.5"
                        style={{ backgroundColor: bg, border: `1px solid ${border}`, color }}
                      >
                        <span
                          className="flex items-center justify-center text-xs font-bold rounded-full flex-shrink-0"
                          style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: "var(--bg-subtle)",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          {prefix}
                        </span>
                        <span>{option}</span>
                        {submitted && isCorrect && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <span className="ml-auto text-xs">✕</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div
                    className="mt-3 text-xs leading-relaxed rounded-md p-2.5"
                    style={{
                      backgroundColor: "var(--bg-overlay)",
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Why: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!submitted && (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(selectedAnswers).length !== insights.quiz.length}
            className="btn-primary w-full mt-4 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        )}

        {submitted && (
          <button
            onClick={() => { setSubmitted(false); setSelectedAnswers({}); }}
            className="btn-secondary w-full mt-4 justify-center"
          >
            Retake Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionInsightsView;