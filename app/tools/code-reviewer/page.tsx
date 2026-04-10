"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runCodeReviewer } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const languages = [
  "JavaScript", "TypeScript", "Python", "Java", "C++",
  "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Other",
];

const CodeReviewer = () => {
  const [form, setForm] = useState({
    code: "", language: "TypeScript", focus: "all" as const,
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.code.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Reviewing your code...");
    const result = await runCodeReviewer(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Code review ready!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="🔧"
      title="Code Reviewer"
      description="Paste your code and get an instant review — bugs, performance issues, and a refactored version."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Language</label>
            <select className="input" value={form.language} onChange={(e) => update("language", e.target.value)}>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Focus</label>
            <select className="input" value={form.focus} onChange={(e) => update("focus", e.target.value)}>
              <option value="all">All</option>
              <option value="bugs">Bugs</option>
              <option value="performance">Performance</option>
              <option value="readability">Readability</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Your Code</label>
          <textarea
            className="input min-h-[400px] max-sm:min-h-[240px] resize-none text-xs"
            placeholder="Paste your code here..."
            value={form.code}
            onChange={(e) => update("code", e.target.value)}
            style={{ fontFamily: "monospace" }}
          />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Reviewing..." : "Review Code →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="code-reviewer" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">🔧</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your code review will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default CodeReviewer;