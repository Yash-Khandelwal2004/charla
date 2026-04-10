import CompanionForm from "@/components/CompanionForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { newCompanionPermissions } from "@/lib/actions/companion.actions";
import Image from "next/image";
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
          <Image
            src="/images/limit.svg"
            alt="Companion limit reached"
            width={300}
            height={200}
            className="opacity-80"
          />
          <div className="cta-badge">Upgrade your plan</div>
          <h1 className="text-2xl font-bold">You've Reached Your Limit</h1>
          <p
            className="text-sm max-w-sm text-center leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            You've reached your companion limit. Upgrade to create more companions and unlock premium features.
          </p>
          <Link href="/subscription" className="w-full max-w-xs">
            <button className="btn-primary w-full justify-center py-3">
              Upgrade My Plan
            </button>
          </Link>
          <Link href="/companions">
            <span className="text-sm transition-colors" style={{ color: "var(--muted-foreground)" }}>
              ← Back to companions
            </span>
          </Link>
        </article>
      )}
    </main>
  );
};

export default NewCompanion;