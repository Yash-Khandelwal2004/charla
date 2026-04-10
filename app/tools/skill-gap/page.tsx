"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runSkillGapAnalyzer } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const SkillGapAnalyzer = () => {
  const [form, setForm] = useState({
    current_skills: "", target_role: "", experience_years: "", timeline: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.current_skills.trim().length > 0 && form.target_role.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Analyzing your skill gap...");
    const result = await runSkillGapAnalyzer(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Analysis complete!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  const timelines = ["1 month", "3 months", "6 months", "1 year", "2+ years"];

  return (
    <ToolPageWrapper
      icon="🎯"
      title="Skill Gap Analyzer"
      description="Compare your current skills against a target role and get a personalized learning roadmap."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Target Role
          </label>
          <input className="input" placeholder="e.g. Senior Frontend Engineer, Data Scientist, Product Manager..."
            value={form.target_role} onChange={(e) => update("target_role", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Years of Experience
            </label>
            <input className="input" placeholder="e.g. 2 years"
              value={form.experience_years} onChange={(e) => update("experience_years", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Your Timeline
            </label>
            <select className="input" value={form.timeline}
              onChange={(e) => update("timeline", e.target.value)}>
              <option value="">Select timeline...</option>
              {timelines.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Your Current Skills & Experience
          </label>
          <textarea
            className="input min-h-[320px] max-sm:min-h-[200px] resize-none"
            placeholder="List your current skills, technologies, and experience...&#10;&#10;Example:&#10;- 2 years of React and JavaScript&#10;- Some Python knowledge&#10;- Built 3 personal projects&#10;- Computer Science degree&#10;- Familiar with REST APIs"
            value={form.current_skills}
            onChange={(e) => update("current_skills", e.target.value)}
          />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Analyzing..." : "Analyze Skill Gap →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="skill-gap" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">🎯</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your personalized learning roadmap will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default SkillGapAnalyzer;