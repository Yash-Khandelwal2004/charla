import CompanionForm from "@/components/CompanionForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { newCompanionPermissions } from "@/lib/actions/companion.actions";
import Link from "next/link";

const NewCompanion = async () => {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const canCreateCompanion = await newCompanionPermissions();

  return (
    <main className="items-center justify-center max-w-2xl mx-auto">
      {canCreateCompanion ? (
        <article className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1>Companion Builder</h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Create a personalized AI tutor for any subject and topic.
            </p>
          </div>
          <CompanionForm />
        </article>
      ) : (
        <article className="companion-limit">
          {/* CSS illustration for limit reached */}
          <div className="relative w-48 h-32 mx-auto mb-4">
            <div
              className="absolute inset-0 rounded-xl"
              style={{ backgroundColor: "var(--surface-2)", border: "1px dashed var(--border)" }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
            >
              🔒
            </div>
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--accent)", opacity: 0.5 }}
            />
          </div>
          <div className="cta-badge">Upgrade your plan</div>
          <h1 className="text-2xl font-bold">You&apos;ve Reached Your Limit</h1>
          <p
            className="text-sm max-w-sm text-center leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            You&apos;ve reached your companion limit. Upgrade to create more companions and unlock premium features.
          </p>
          <Link href="/subscription" className="w-full max-w-xs">
            <button className="btn-primary w-full justify-center py-3">
              Upgrade My Plan
            </button>
          </Link>
          <Link href="/companions">
            <span
              className="text-sm transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              ← Back to companions
            </span>
          </Link>
        </article>
      )}
    </main>
  );
};

export default NewCompanion;