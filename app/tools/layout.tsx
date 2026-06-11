import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkToolLimit } from "@/lib/actions/tools.actions";
import Link from "next/link";

const ToolsLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { allowed, used, limit, isPro } = await checkToolLimit();

  return (
    <div>
      {/* Usage banner — shown only on free tier */}
      {!isPro && (
        <div
          className="w-full px-6 max-sm:px-4 py-2 flex items-center justify-between gap-4"
          style={{
            backgroundColor: used >= limit * 0.8 ? "var(--surface-2)" : "var(--surface-1)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-1.5 rounded-full overflow-hidden w-24"
              style={{ backgroundColor: "var(--surface-3)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((used / limit) * 100, 100)}%`,
                  backgroundColor: used >= limit ? "var(--destructive)" : used >= limit * 0.8 ? "#f59e0b" : "var(--accent)",
                }}
              />
            </div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {used}/{limit} free tool uses this month
            </span>
          </div>
          <Link href="/subscription">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-md cursor-pointer"
              style={{
                backgroundColor: "var(--accent-muted)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
              }}
            >
              Upgrade to Pro →
            </span>
          </Link>
        </div>
      )}

      {/* Limit reached wall */}
      {!allowed ? (
        <main>
          <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <span className="text-5xl">🔒</span>
            <h1 className="text-2xl font-bold">Monthly limit reached</h1>
            <p className="max-w-md" style={{ color: "var(--muted-foreground)" }}>
              You&apos;ve used all {limit} free tool uses for this month. Upgrade to Pro for unlimited access.
            </p>
            <div className="flex gap-3">
              <Link href="/subscription">
                <button className="btn-primary px-6 py-2.5">Upgrade to Pro</button>
              </Link>
              <Link href="/">
                <button className="btn-secondary px-6 py-2.5">Go Home</button>
              </Link>
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Resets on the 1st of each month
            </p>
          </div>
        </main>
      ) : (
        children
      )}
    </div>
  );
};

export default ToolsLayout;