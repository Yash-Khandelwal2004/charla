"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runEmailDraft } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const EmailDraft = () => {
  const [form, setForm] = useState({
    context: "", recipient: "", tone: "formal" as const, key_points: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.context && form.recipient && form.key_points;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Drafting your email...");
    const result = await runEmailDraft(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Email drafted!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <ToolPageWrapper
      icon="📧"
      title="Email Drafting"
      description="Describe what you want to say and get a polished, ready-to-send email instantly."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Recipient</label>
            <input className="input" placeholder="e.g. My manager, HR team..."
              value={form.recipient} onChange={(e) => update("recipient", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Tone</label>
            <select className="input" value={form.tone} onChange={(e) => update("tone", e.target.value)}>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="assertive">Assertive</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Context</label>
          <textarea className="input min-h-[120px] resize-none"
            placeholder="What's the situation? What do you want to achieve?"
            value={form.context} onChange={(e) => update("context", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Key Points to Cover</label>
          <textarea className="input min-h-[150px] resize-none"
            placeholder="List the main things you want to say or ask..."
            value={form.key_points} onChange={(e) => update("key_points", e.target.value)} />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Drafting..." : "Draft Email →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="email-draft" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">📧</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your drafted email will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default EmailDraft;