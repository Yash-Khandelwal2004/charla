"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runColdOutreach } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const ColdOutreach = () => {
  const [form, setForm] = useState({
    your_name: "", your_role: "", target_name: "", target_company: "",
    purpose: "job" as const, context: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.your_name && form.target_name && form.target_company && form.context;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Writing your outreach...");
    const result = await runColdOutreach(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Outreach ready!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="📬"
      title="Cold Outreach Writer"
      description="Write personalized cold emails and LinkedIn messages that actually get replies."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          {[
            { key: "your_name", label: "Your Name", placeholder: "John Doe" },
            { key: "your_role", label: "Your Role", placeholder: "Software Engineer" },
            { key: "target_name", label: "Recipient Name", placeholder: "Jane Smith" },
            { key: "target_company", label: "Recipient Company", placeholder: "Google" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</label>
              <input className="input" placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Purpose</label>
          <select className="input" value={form.purpose} onChange={(e) => update("purpose", e.target.value)}>
            <option value="job">Job Opportunity</option>
            <option value="networking">Networking</option>
            <option value="collaboration">Collaboration</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Context / Hook</label>
          <textarea className="input min-h-[120px] resize-none"
            placeholder="Why are you reaching out? Any mutual connections, their recent work..."
            value={form.context} onChange={(e) => update("context", e.target.value)} />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Writing..." : "Write Outreach →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="cold-outreach" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">📬</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your outreach emails will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default ColdOutreach;