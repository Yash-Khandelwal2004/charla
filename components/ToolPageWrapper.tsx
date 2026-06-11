"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SkeletonOutput from "@/components/SkeletonOutput";

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
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link
          href="/tools"
          className="flex items-center gap-1 hover:underline"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ChevronLeft size={14} />
          Tools
        </Link>
        <span style={{ color: "var(--muted-foreground)" }}>→</span>
        <span style={{ color: "var(--foreground)" }}>{title}</span>
      </div>

      {/* Header */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-lg text-xl"
            style={{
              backgroundColor: "var(--accent-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {icon}
          </div>
          <h1 className="text-3xl max-sm:text-2xl">{title}</h1>
        </div>
        <p className="text-sm max-w-xl" style={{ color: "var(--muted-foreground)" }}>
          {description}
        </p>
      </section>

      <div className="divider" />

      {/* Loading state — skeleton */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)" }}
        >
          <div className="w-full max-w-lg px-4">
            <SkeletonOutput />
            <p
              className="text-sm font-medium text-center mt-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              Charla is thinking...
            </p>
          </div>
        </div>
      )}

      {/* Content — 40/60 split */}
      <div className="grid grid-cols-[2fr_3fr] gap-6 max-lg:grid-cols-1">
        {children}
      </div>
    </main>
  );
};

export default ToolPageWrapper;