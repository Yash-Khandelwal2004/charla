"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runResumeBuilder } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";
import FileUpload from "@/components/FileUpload";

const ResumeBuilder = () => {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", location: "",
    summary: "", experience: "", education: "", skills: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.full_name && form.email && form.experience && form.skills;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Building your resume...");
    const result = await runResumeBuilder(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Resume built!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="📝"
      title="Resume Builder"
      description="Fill in your details and get a polished, ATS-optimized resume instantly."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">

        {/* Optional resume import */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Already have a resume? <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(optional)</span>
          </label>
          <div
            className="flex flex-col gap-2 rounded-xl p-3"
            style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)" }}
          >
            <FileUpload
              label="Upload an existing resume (PDF or DOCX)"
              onExtract={(text) => update("experience", text)}
            />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              We'll drop the extracted text into "Work Experience" below — edit it however you like before generating.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          {[
            { key: "full_name", label: "Full Name", placeholder: "John Doe" },
            { key: "email", label: "Email", placeholder: "john@example.com" },
            { key: "phone", label: "Phone", placeholder: "+1 234 567 8900" },
            { key: "location", label: "Location", placeholder: "New York, USA" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</label>
              <input className="input" placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key, e.target.value)} />
            </div>
          ))}
        </div>
        {[
          { key: "summary", label: "Professional Summary", placeholder: "Brief overview of who you are...", h: "min-h-[80px]" },
          { key: "experience", label: "Work Experience", placeholder: "Company, role, dates, key achievements...", h: "min-h-[120px]" },
          { key: "education", label: "Education", placeholder: "Degree, institution, year...", h: "min-h-[80px]" },
          { key: "skills", label: "Skills", placeholder: "React, TypeScript, Node.js...", h: "min-h-[80px]" },
        ].map(({ key, label, placeholder, h }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</label>
            <textarea className={`input ${h} resize-none`} placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={(e) => update(key, e.target.value)} />
          </div>
        ))}
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Building..." : "Build Resume →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="resume-builder" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">📄</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your generated resume will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default ResumeBuilder;