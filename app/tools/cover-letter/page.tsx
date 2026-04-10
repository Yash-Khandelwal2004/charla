"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runCoverLetter } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const CoverLetter = () => {
  const [form, setForm] = useState({
    resume: "", job_description: "", company_name: "", tone: "formal" as const,
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.resume && form.job_description && form.company_name;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Writing your cover letter...");
    const result = await runCoverLetter(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Cover letter ready!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="✉️"
      title="Cover Letter Generator"
      description="Generate a tailored, human-sounding cover letter for any job."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Company Name</label>
          <input className="input" placeholder="Google, Stripe, etc."
            value={form.company_name} onChange={(e) => update("company_name", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Tone</label>
          <select className="input" value={form.tone} onChange={(e) => update("tone", e.target.value)}>
            <option value="formal">Formal</option>
            <option value="friendly">Friendly</option>
            <option value="enthusiastic">Enthusiastic</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Your Resume / Background</label>
          <textarea className="input min-h-[160px] resize-none" placeholder="Paste your resume or key experience..."
            value={form.resume} onChange={(e) => update("resume", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Job Description</label>
          <textarea className="input min-h-[160px] resize-none" placeholder="Paste the job description..."
            value={form.job_description} onChange={(e) => update("job_description", e.target.value)} />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Writing..." : "Generate Cover Letter →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="cover-letter" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">✉️</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your cover letter will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default CoverLetter;