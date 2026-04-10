import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Subscription = async () => {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <main className="max-w-4xl mx-auto">
      {/* Header */}
      <section className="flex flex-col items-center text-center gap-3">
        <span
          className="text-xs px-3 py-1 rounded-full font-medium tracking-wide uppercase"
          style={{
            backgroundColor: "var(--accent-muted)",
            color: "var(--accent)",
            border: "1px solid var(--accent)",
          }}
        >
          Pricing
        </span>
        <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          Start for free. More coming soon.
        </p>
      </section>

      {/* Plans */}
      <section className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">

        {/* Free Plan */}
        <div
          className="rounded-lg p-6 flex flex-col gap-4"
          style={{
            backgroundColor: "var(--surface-1)",
            border: "1px solid var(--surface-3)",
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Free</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--muted-foreground)",
                  border: "1px solid var(--surface-3)",
                }}
              >
                Current Plan
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-sm pb-1" style={{ color: "var(--muted-foreground)" }}>/month</span>
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Perfect for getting started
            </p>
          </div>

          <div className="divider" />

          <ul className="flex flex-col gap-2.5">
            {[
              "3 AI companions",
              "10 tool uses per month",
              "All 11 AI tools",
              "Voice learning sessions",
              "Session history",
              "Bookmarks",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <span style={{ color: "var(--accent)" }}>✓</span>
                <span style={{ color: "var(--muted-foreground)" }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div
          className="rounded-lg p-6 flex flex-col gap-4 relative"
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--accent)",
          }}
        >
          {/* Coming Soon badge */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap"
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
            }}
          >
            Coming Soon
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Pro</h2>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold">$5</span>
              <span className="text-sm pb-1" style={{ color: "var(--muted-foreground)" }}>/month</span>
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              For serious learners and job seekers
            </p>
          </div>

          <div className="divider" />

          <ul className="flex flex-col gap-2.5">
            {[
              "Unlimited AI companions",
              "Unlimited tool uses",
              "All 11 AI tools",
              "Voice learning sessions",
              "Priority AI responses",
              "Session history",
              "Bookmarks",
              "Early access to new tools",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <span style={{ color: "var(--accent)" }}>✓</span>
                <span style={{ color: "var(--foreground)" }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-4">
        <h2 className="section-title">FAQ</h2>
        <div className="flex flex-col gap-3">
          {[
            {
              q: "What counts as a tool use?",
              a: "Each time you submit a form and get a result from any of the 11 AI tools, that counts as one use. Your limit resets on the 1st of every month.",
            },
            {
              q: "What happens when I hit the companion limit?",
              a: "You can still use all your existing companions. You just won't be able to create new ones until you're on the Pro plan.",
            },
            {
              q: "When will Pro be available?",
              a: "We're working on payment integration and will launch Pro soon. You'll be notified when it's available.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-lg p-5 flex flex-col gap-2"
              style={{
                backgroundColor: "var(--surface-1)",
                border: "1px solid var(--surface-3)",
              }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{q}</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Subscription;