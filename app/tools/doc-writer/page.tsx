"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runDocWriter } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const DocWriter = () => {
  const [form, setForm] = useState({
    content: "", doc_type: "code" as const, audience: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.content.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Writing documentation...");
    const result = await runDocWriter(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Documentation ready!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  const docTypes = [
    { value: "code", label: "Code", desc: "Functions, classes, modules", icon: "💻" },
    { value: "api", label: "API", desc: "Endpoints & schemas", icon: "🔌" },
    { value: "process", label: "Process", desc: "Step-by-step guides", icon: "📋" },
  ];

  return (
    <ToolPageWrapper
      icon="📖"
      title="Documentation Writer"
      description="Paste your code, API, or process and get clean, professional documentation instantly."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Documentation Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {docTypes.map(({ value, label, desc, icon }) => (
              <button
                key={value}
                onClick={() => update("doc_type", value)}
                className="flex flex-col gap-1 p-3 rounded-lg text-left transition-all duration-150"
                style={{
                  backgroundColor: form.doc_type === value ? "var(--primary-muted)" : "var(--surface-2)",
                  border: `1px solid ${form.doc_type === value ? "var(--primary)" : "var(--surface-3)"}`,
                }}
              >
                <span className="text-base">{icon}</span>
                <span className="text-sm font-medium" style={{ color: form.doc_type === value ? "var(--primary)" : "var(--foreground)" }}>
                  {label}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Target Audience (optional)
          </label>
          <input className="input" placeholder="e.g. Junior developers, End users, DevOps team..."
            value={form.audience} onChange={(e) => update("audience", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {form.doc_type === "code" ? "Your Code" : form.doc_type === "api" ? "API Details" : "Process Description"}
          </label>
          <textarea
            className="input min-h-[360px] max-sm:min-h-[220px] resize-none"
            placeholder={
              form.doc_type === "code"
                ? "Paste your function, class, or module here..."
                : form.doc_type === "api"
                ? "Paste your API endpoint details, route, params, response..."
                : "Describe the process or paste your existing process notes..."
            }
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            style={{ fontFamily: form.doc_type === "code" ? "monospace" : "inherit", fontSize: form.doc_type === "code" ? "12px" : "14px" }}
          />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Writing..." : "Write Documentation →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="doc-writer" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">📖</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your documentation will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default DocWriter;