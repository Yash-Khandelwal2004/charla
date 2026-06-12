"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runATSScanner } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";
import FileUpload from "@/components/FileUpload";

const ATSScanner = () => {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!resume.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Scanning your resume...");
    const result = await runATSScanner({ resume, job_description: jobDescription });
    if (result.success) {
      setOutput(result.output);
      toast.success("ATS scan complete!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  // Left column — inputs
  const inputPanel = (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          Your Resume
        </label>

        <div
          className="flex flex-col gap-3 rounded-xl p-3"
          style={{
            backgroundColor: "var(--surface-1)",
            border: "1px solid var(--border)",
          }}
        >
          <FileUpload
            label="Upload your resume (PDF or DOCX)"
            onExtract={(text) => setResume(text)}
          />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
            <span
              className="text-xs font-semibold tracking-wide"
              style={{ color: "var(--muted-foreground)" }}
            >
              OR PASTE TEXT
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
          </div>

          <textarea
            className="input min-h-[200px] resize-none"
            placeholder="Paste your full resume text here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Job Description</label>
        <textarea className="input min-h-[240px] resize-none" placeholder="Paste the job description here..."
          value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
      </div>

      <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
        disabled={loading || !resume.trim() || !jobDescription.trim()}
        style={{ opacity: loading || !resume.trim() || !jobDescription.trim() ? 0.5 : 1 }}>
        {loading ? "Scanning..." : "Scan Resume →"}
      </button>
    </div>
  );

  // Right column — output
  const outputPanel = output ? (
    <ToolOutput output={output} toolName="ats-scanner" />
  ) : (
    <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
      style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
      <span className="text-4xl">📊</span>
      <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
        Your ATS score and feedback will appear here
      </p>
    </div>
  );

  return (
    <ToolPageWrapper
      icon="📄"
      title="ATS Scanner"
      description="Paste your resume and a job description to get an ATS match score, missing keywords, and actionable improvements."
      loading={loading}
    >
      {inputPanel}
      {outputPanel}
    </ToolPageWrapper>
  );
};

export default ATSScanner;