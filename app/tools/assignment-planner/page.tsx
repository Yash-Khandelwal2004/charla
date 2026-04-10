"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runAssignmentPlanner } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const AssignmentPlanner = () => {
  const [form, setForm] = useState({
    assignment_brief: "", subject: "", deadline: "", word_count: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.assignment_brief && form.subject && form.deadline;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Planning your assignment...");
    const result = await runAssignmentPlanner(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Plan ready!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="📅"
      title="Assignment Planner"
      description="Turn any assignment brief into a structured plan with day-by-day tasks and research starting points."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Subject</label>
            <input className="input" placeholder="e.g. Computer Science"
              value={form.subject} onChange={(e) => update("subject", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Deadline</label>
            <input className="input" type="date"
              value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Word Count (optional)</label>
          <input className="input" placeholder="e.g. 3000 words"
            value={form.word_count} onChange={(e) => update("word_count", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Assignment Brief</label>
          <textarea
            className="input min-h-[300px] max-sm:min-h-[200px] resize-none"
            placeholder="Paste your assignment brief or describe what you need to do..."
            value={form.assignment_brief}
            onChange={(e) => update("assignment_brief", e.target.value)}
          />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Planning..." : "Generate Plan →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="assignment-planner" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">📅</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your assignment plan will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default AssignmentPlanner;