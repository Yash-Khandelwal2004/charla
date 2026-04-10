"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runLinkedInBio } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const LinkedInBio = () => {
  const [form, setForm] = useState({
    current_role: "", experience: "", skills: "", goal: "", tone: "professional" as const,
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.current_role && form.experience && form.skills && form.goal;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Writing your LinkedIn bio...");
    const result = await runLinkedInBio(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("LinkedIn bio ready!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="💼"
      title="LinkedIn Bio Writer"
      description="Get an optimized LinkedIn headline, about section, and profile tips."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Current Role / Title</label>
          <input className="input" placeholder="e.g. Full Stack Developer at Startup"
            value={form.current_role} onChange={(e) => update("current_role", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Tone</label>
          <select className="input" value={form.tone} onChange={(e) => update("tone", e.target.value)}>
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Experience Summary</label>
          <textarea className="input min-h-[100px] resize-none"
            placeholder="Years of experience, companies, key achievements..."
            value={form.experience} onChange={(e) => update("experience", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Top Skills</label>
          <textarea className="input min-h-[80px] resize-none"
            placeholder="React, TypeScript, Leadership..."
            value={form.skills} onChange={(e) => update("skills", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Career Goal</label>
          <textarea className="input min-h-[80px] resize-none"
            placeholder="What are you looking for or trying to attract?"
            value={form.goal} onChange={(e) => update("goal", e.target.value)} />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Writing..." : "Generate LinkedIn Bio →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="linkedin-bio" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">💼</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your LinkedIn bio will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default LinkedInBio;