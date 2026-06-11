import Link from "next/link";
import { tools } from "@/constants";

const categoryColors: Record<string, string> = {
  career: "var(--accent)",
  academic: "#0284c7",
  productivity: "#059669",
};

const toolCategories = [
  { id: "all", label: "All" },
  { id: "career", label: "Career" },
  { id: "academic", label: "Academic" },
  { id: "productivity", label: "Productivity" },
];

const ToolsPage = () => {
  return (
    <main>
      {/* Header */}
      <section className="flex justify-between items-center gap-4 max-sm:flex-col max-sm:items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl max-sm:text-2xl font-bold">
            AI <span style={{ color: "var(--accent)" }}>Tools</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Practical AI tools for your career, academics, and daily work.
          </p>
        </div>
      </section>

      <div className="divider" />

      {/* Category sections */}
      {[
        { id: "career", label: "Career & Jobs", emoji: "💼" },
        { id: "academic", label: "Academics", emoji: "🎓" },
        { id: "productivity", label: "Productivity", emoji: "⚡" },
      ].map((category) => {
        const categoryTools = tools.filter((t) => t.category === category.id);
        const borderColor = categoryColors[category.id] || "var(--accent)";
        return (
          <section key={category.id} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{category.emoji}</span>
              <h2 className="section-title">{category.label}</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-md ml-1"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--muted-foreground)" }}
              >
                {categoryTools.length}
              </span>
            </div>

            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            >
              {categoryTools.map((tool) => (
                <Link href={tool.href} key={tool.id}>
                  <article
                    className="tool-card h-full group"
                    style={{ borderLeft: `3px solid ${borderColor}` }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="tool-icon text-xl"
                        style={{ backgroundColor: "var(--accent-muted)" }}
                      >
                        {tool.icon}
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md capitalize"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          color: "var(--muted-foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {tool.category}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3
                        className="font-semibold text-[15px]"
                        style={{ color: "var(--foreground)" }}
                      >
                        {tool.label}
                      </h3>
                      <p
                        className="text-[13px] line-clamp-2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {tool.description}
                      </p>
                    </div>
                    <div
                      className="text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ color: "var(--accent)" }}
                    >
                      Open tool →
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
};

export default ToolsPage;