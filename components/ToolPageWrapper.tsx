"use client";
import Link from "next/link";

interface ToolPageWrapperProps {
  icon: string;
  title: string;
  description: string;
  loading: boolean;
  children: React.ReactNode;
}

const ToolPageWrapper = ({ icon, title, description, loading, children }: ToolPageWrapperProps) => {
  return (
    <main>
      {/* Back nav */}
      <Link
        href="/tools"
        className="flex items-center gap-1.5 text-sm w-fit hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        ← Back to Tools
      </Link>

      {/* Header */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl max-sm:text-xl">{icon}</span>
          <h1 className="text-3xl max-sm:text-2xl">{title}</h1>
        </div>
        <p className="text-sm max-w-xl" style={{ color: "var(--muted-foreground)" }}>{description}</p>
      </section>

      <div className="divider" />

      {/* Loading overlay */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
            <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              Charla is thinking...
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        {children}
      </div>
    </main>
  );
};

export default ToolPageWrapper;