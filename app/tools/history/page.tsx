import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserToolUsage } from "@/lib/actions/tools.actions";
import Link from "next/link";
import { tools } from "@/constants";

const ToolsHistoryPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const toolUsage = await getUserToolUsage(50);

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get tool metadata from constants
  const getToolMeta = (toolName: string) => {
    return tools.find((t) => t.id === toolName) ?? {
      label: toolName,
      icon: "🔧",
      category: "productivity",
    };
  };

  return (
    <main>
      {/* Header */}
      <section className="flex justify-between items-center gap-4 max-sm:flex-col max-sm:items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl max-sm:text-2xl font-bold">
            Tool <span style={{ color: "var(--accent)" }}>History</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            All your past tool uses in one place
          </p>
        </div>
        <Link href="/tools">
          <button className="btn-secondary">← Back to Tools</button>
        </Link>
      </section>

      <div className="divider" />

      {/* History list */}
      {toolUsage.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-16 text-center"
          style={{
            backgroundColor: "var(--surface-1)",
            border: "1px dashed var(--border)",
            borderRadius: "10px",
          }}
        >
          <span className="text-4xl">🔧</span>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            No tool uses yet.{" "}
            <Link href="/tools" style={{ color: "var(--accent)" }}>
              Browse tools →
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {toolUsage.map((usage) => {
            const meta = getToolMeta(usage.tool_name);
            return (
              <details
                key={usage.id}
                className="group"
                style={{
                  backgroundColor: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                }}
              >
                <summary
                  className="flex items-center justify-between px-4 py-3 cursor-pointer list-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {meta.label}
                      </p>
                      <p
                        className="text-xs line-clamp-1 max-w-[400px] max-sm:max-w-[200px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {usage.output.slice(0, 80)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md capitalize max-sm:hidden"
                      style={{
                        backgroundColor: "var(--surface-2)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {meta.category}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {formatDate(usage.created_at)}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--accent)" }}
                    >
                      View ▾
                    </span>
                  </div>
                </summary>
                <div
                  className="px-4 pb-4 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div
                    className="p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto"
                    style={{
                      backgroundColor: "var(--surface-2)",
                      color: "var(--muted-foreground)",
                      borderRadius: "8px",
                    }}
                  >
                    {usage.output}
                  </div>
                  <div className="flex justify-end mt-3">
                    <Link href={`/tools/${usage.tool_name}`}>
                      <button className="btn-primary text-xs py-1.5 px-3">
                        Use again →
                      </button>
                    </Link>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default ToolsHistoryPage;
