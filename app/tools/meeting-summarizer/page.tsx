"use client";
import { useState } from "react";
import { toast } from "sonner";
import { runMeetingSummarizer } from "@/lib/actions/tools.actions";
import ToolOutput from "@/components/ToolOutput";
import ToolPageWrapper from "@/components/ToolPageWrapper";

const MeetingSummarizer = () => {
  const [form, setForm] = useState({
    transcript: "", meeting_type: "", participants: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isValid = form.transcript.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setOutput("");
    const toastId = toast.loading("Summarizing meeting...");
    const result = await runMeetingSummarizer(form);
    if (result.success) {
      setOutput(result.output);
      toast.success("Meeting summarized!", { id: toastId });
    } else {
      toast.error(result.error || "Something went wrong.", { id: toastId });
    }
    setLoading(false);
  };

  const meetingTypes = ["Team Standup", "Sprint Planning", "Client Call", "1:1", "Brainstorm", "Other"];

  return (
    <ToolPageWrapper
      icon="🗒️"
      title="Meeting Summarizer"
      description="Paste any meeting transcript and get a clean summary, action items, and key decisions."
      loading={loading}
    >
      {/* Input panel */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Meeting Type (optional)
            </label>
            <select className="input" value={form.meeting_type}
              onChange={(e) => update("meeting_type", e.target.value)}>
              <option value="">Select type...</option>
              {meetingTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Participants (optional)
            </label>
            <input className="input" placeholder="e.g. John, Sarah, Dev Team"
              value={form.participants} onChange={(e) => update("participants", e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Meeting Transcript
          </label>
          <textarea
            className="input min-h-[400px] max-sm:min-h-[240px] resize-none"
            placeholder="Paste the full meeting transcript here...&#10;&#10;You can also paste rough notes or bullet points — it doesn't have to be a formal transcript."
            value={form.transcript}
            onChange={(e) => update("transcript", e.target.value)}
          />
        </div>
        <button className="btn-primary justify-center w-full py-3" onClick={handleSubmit}
          disabled={loading || !isValid} style={{ opacity: loading || !isValid ? 0.5 : 1 }}>
          {loading ? "Summarizing..." : "Summarize Meeting →"}
        </button>
      </div>

      {/* Output panel */}
      {output ? (
        <ToolOutput output={output} toolName="meeting-summarizer" />
      ) : (
        <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}>
          <span className="text-4xl">🗒️</span>
          <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Your meeting summary and action items will appear here
          </p>
        </div>
      )}
    </ToolPageWrapper>
  );
};

export default MeetingSummarizer;