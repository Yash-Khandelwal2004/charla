"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runSalaryCoach } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const SalaryCoach = () => {
  const [form, setForm] = useState({
    role: "", current_offer: "", target_salary: "", experience_years: "", location: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.role && form.current_offer && form.target_salary && form.experience_years;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Building your negotiation strategy...");
    const result = await runSalaryCoach(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Strategy ready!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="💰"
      title="Salary Coach"
      description="Get a negotiation strategy, exact scripts, and counter-offer range for your job offer."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        {[
          { key: "role", label: "Job Role", placeholder: "e.g. Senior Frontend Engineer" },
          { key: "current_offer", label: "Current Offer", placeholder: "e.g. $95,000 / year" },
          { key: "target_salary", label: "Target Salary", placeholder: "e.g. $115,000 / year" },
          { key: "experience_years", label: "Years of Experience", placeholder: "e.g. 4 years" },
          { key: "location", label: "Location", placeholder: "e.g. San Francisco, CA" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</label>
            <input className="input" placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={(e) => update(key, e.target.value)} />
          </div>
        ))}
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Coaching..." : "Get Negotiation Strategy →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="salary-coach" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">💰</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your negotiation strategy will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default SalaryCoach;