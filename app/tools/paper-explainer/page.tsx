"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runPaperExplainer } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const PaperExplainer = () => {
  const [paperText, setPaperText] = useState("");
  const [detailLevel, setDetailLevel] = useState<"simple" | "intermediate" | "detailed">("intermediate");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!paperText.trim()) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Explaining the paper...");
    const result = await runPaperExplainer({ paper_text: paperText, detail_level: detailLevel });
    if (result.success) {
      setOutput(result.output);
      toast.success("Paper explained!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  const levels = [
    { value: "simple", label: "Simple", desc: "Plain English" },
    { value: "intermediate", label: "Intermediate", desc: "Balanced" },
    { value: "detailed", label: "Detailed", desc: "Technical" },
  ];

  return (
    <ToolPageWrapper
      icon="🎓"
      title="Paper Explainer"
      description="Paste any research paper and get a clear breakdown — findings, methodology, and why it matters."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Detail Level</label>
          <div className="grid grid-cols-3 gap-2">
            {levels.map(({ value, label, desc }) => (
              <button key={value} onClick={() => setDetailLevel(value as typeof detailLevel)}
                className="flex flex-col gap-1 p-3 rounded-lg text-left transition-all duration-150"
                style={{
                  backgroundColor: detailLevel === value ? "var(--primary-muted)" : "var(--surface-2)",
                  border: `1px solid ${detailLevel === value ? "var(--primary)" : "var(--surface-3)"}`,
                }}>
                <span className="text-sm font-medium" style={{ color: detailLevel === value ? "var(--primary)" : "var(--foreground)" }}>
                  {label}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Paper Text</label>
          <textarea
            className="input min-h-[380px] max-sm:min-h-[240px] resize-none"
            placeholder="Paste the research paper abstract or full text here..."
            value={paperText}
            onChange={(e) => setPaperText(e.target.value)}
          />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !paperText.trim()}
          style={{ opacity: loading || !paperText.trim() ? 0.5 : 1 }}>
          {loading ? "Explaining..." : "Explain Paper →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="paper-explainer" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">🎓</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Paper breakdown will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default PaperExplainer;