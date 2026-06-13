"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runPlagiarismRewriter } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const PlagiarismRewriter = () => {
  const [form, setForm] = useState({
    text: "", style: "academic" as const, subject: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.text.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Rewriting your text...");
    const result = await runPlagiarismRewriter(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Rewrite complete!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  const styles = [
    { value: "academic", label: "Academic", desc: "Formal & scholarly" },
    { value: "professional", label: "Professional", desc: "Business writing" },
    { value: "casual", label: "Casual", desc: "Natural & readable" },
  ];

  return (
    <ToolPageWrapper
      icon="✏️"
      title="Plagiarism Rewriter"
      description="Rephrase flagged content while keeping the original meaning and all key information intact."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Rewriting Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {styles.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => update("style", value)}
                className="flex flex-col gap-1 p-3 rounded-lg text-left transition-all duration-150"
                style={{
                  backgroundColor: form.style === value ? "var(--accent-muted)" : "var(--surface-2)",
                  border: `1px solid ${form.style === value ? "var(--accent)" : "var(--surface-3)"}`,
                }}
              >
                <span className="text-sm font-medium" style={{ color: form.style === value ? "var(--accent)" : "var(--foreground)" }}>
                  {label}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Subject / Context (optional)
          </label>
          <input className="input" placeholder="e.g. Computer Science, History, Business..."
            value={form.subject} onChange={(e) => update("subject", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Text to Rewrite
          </label>
          <textarea
            className="input min-h-[360px] max-sm:min-h-[220px] resize-none"
            placeholder="Paste the text you want to rewrite here..."
            value={form.text}
            onChange={(e) => update("text", e.target.value)}
          />
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {form.text.length} characters
          </p>
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Rewriting..." : "Rewrite Text →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="plagiarism-rewriter" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">✏️</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your rewritten text will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default PlagiarismRewriter;