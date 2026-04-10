"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runJDDecoder } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const JDDecoder = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Decoding job description...");
    const result = await runJDDecoder({ job_description: jobDescription });
    if (result.success) {
      setOutput(result.output);
      toast.success("JD decoded!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="🔍"
      title="JD Decoder"
      description="Paste any job description and find out what the employer actually wants — must-haves, red flags, hidden requirements, and more."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Job Description
          </label>
          <textarea
            className="input min-h-[400px] max-sm:min-h-[240px] resize-none"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !jobDescription.trim()}
          style={{ opacity: loading || !jobDescription.trim() ? 0.5 : 1 }}>
          {loading ? "Decoding..." : "Decode JD →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="jd-decoder" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">🔍</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Decoded insights will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default JDDecoder;