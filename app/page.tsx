import { getAllCompanions, getRecentSessions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import Link from "next/link";
import { tools } from "@/constants";
import { SignInButton } from "@clerk/nextjs";

const featuredTools = tools.slice(0, 6);

const Page = async () => {
  const user = await currentUser();
  const companions = await getAllCompanions({ limit: 3 });
  const recentSessionsCompanions = await getRecentSessions(10);

  // ── Logged-in view ──────────────────────────────────
  if (user) {
    return (
      <main>
        <section className="flex flex-col gap-2 pt-2">
          <span className="tool-badge w-fit">Beta</span>
          <h1 className="text-3xl max-sm:text-2xl font-bold tracking-tight">
            Welcome back,{" "}
            <span style={{ color: "var(--accent)" }}>{user.firstName}</span>
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--muted-foreground)" }}>
            Pick up where you left off — learn from companions or use your AI tools.
          </p>
          <div className="flex gap-3 mt-1 flex-wrap">
            <Link href="/companions">
              <button className="btn-primary">Explore Companions</button>
            </Link>
            <Link href="/tools">
              <button className="btn-secondary">Browse Tools</button>
            </Link>
          </div>
        </section>

        <div className="divider" />

        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="section-title">Popular Companions</h2>
            <Link href="/companions" className="text-sm" style={{ color: "var(--accent)" }}>
              View all →
            </Link>
          </div>
          <div className="companions-grid">
            {companions.map((companion) => (
              <CompanionCard key={companion.id} {...companion} color={getSubjectColor(companion.subject)} />
            ))}
          </div>
        </section>

        <div className="divider" />

        <section className="home-section">
          <CompanionsList title="Recently completed sessions" companions={recentSessionsCompanions} classNames="w-2/3 max-lg:w-full" />
          <CTA />
        </section>
      </main>
    );
  }

  // ── Visitor landing page ─────────────────────────────
  return (
    <main className="!pt-0 !gap-0 !px-0">

      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6 py-20 max-sm:py-14 px-6 max-sm:px-4">
        <div
          className="text-xs px-3 py-1 rounded-full font-medium tracking-wide uppercase"
          style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)", border: "1px solid var(--accent)" }}
        >
          Now in Beta
        </div>
        <h1 className="text-5xl max-md:text-4xl max-sm:text-3xl font-bold tracking-tight max-w-3xl leading-tight">
          Your AI companion for{" "}
          <span style={{ color: "var(--accent)" }}>career & learning</span>
        </h1>
        <p className="text-lg max-sm:text-base max-w-xl" style={{ color: "var(--muted-foreground)" }}>
          Learn from voice-powered AI companions, prep for interviews, scan your resume, review code — everything a student or professional needs, in one place.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <SignInButton>
            <button className="btn-primary px-6 py-3 text-base">
              Get Started Free →
            </button>
          </SignInButton>
          <Link href="#features">
            <button className="btn-secondary px-6 py-3 text-base">
              See Features
            </button>
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section
        className="flex justify-center gap-8 max-sm:gap-6 py-8 flex-wrap px-4"
        style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-1)" }}
      >
        {[
          { value: "11+", label: "AI Tools" },
          { value: "6", label: "Subjects" },
          { value: "Voice", label: "Powered" },
          { value: "Free", label: "to Start" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-2xl max-sm:text-xl font-bold" style={{ color: "var(--foreground)" }}>{value}</span>
            <span className="text-sm max-sm:text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="flex flex-col items-center gap-10 py-20 max-sm:py-14 px-6 max-sm:px-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl max-sm:text-2xl font-bold tracking-tight">
            Everything you need to get ahead
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            From acing interviews to understanding research papers
          </p>
        </div>

        {/* Two column feature highlights */}
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 w-full max-w-4xl">
          <div
            className="rounded-lg p-6 flex flex-col gap-3"
            style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--surface-3)", borderLeft: "3px solid var(--accent)" }}
          >
            <span className="text-3xl">🤖</span>
            <h3 className="text-xl max-sm:text-lg font-bold">AI Companions</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Create personalized AI tutors for any subject. Have real voice conversations that adapt to your learning style.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Maths", "Science", "Coding", "History", "Language", "Economics"].map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-md"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--muted-foreground)" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-lg p-6 flex flex-col gap-3"
            style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--surface-3)" }}
          >
            <span className="text-3xl">🛠️</span>
            <h3 className="text-xl max-sm:text-lg font-bold">11 AI Tools</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Practical tools for your career and academics — ATS scanner, resume builder, code reviewer, and more.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {featuredTools.map((tool) => (
                <span key={tool.id} className="text-xs px-2 py-1 rounded-md"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--muted-foreground)" }}>
                  {tool.icon} {tool.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tool grid preview */}
        <div className="grid gap-3 w-full max-w-4xl"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {tools.map((tool) => (
            <div key={tool.id} className="tool-card">
              <div className="flex items-center gap-2">
                <span className="text-lg">{tool.icon}</span>
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{tool.label}</span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="flex flex-col items-center gap-5 py-20 max-sm:py-14 px-4 text-center"
        style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--surface-1)" }}
      >
        <h2 className="text-3xl max-sm:text-2xl font-bold tracking-tight">Ready to get started?</h2>
        <p style={{ color: "var(--muted-foreground)" }}>Free to use. No credit card required.</p>
        <SignInButton>
          <button className="btn-primary px-8 py-3 text-base">
            Start for Free →
          </button>
        </SignInButton>
      </section>

    </main>
  );
};

export default Page;