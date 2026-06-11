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

  // ── Logged-in dashboard ──────────────────────────────
  if (user) {
    const now = new Date();
    const hour = now.getHours();
    const greeting =
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    return (
      <main>
        {/* Greeting */}
        <section className="flex flex-col gap-2 pt-2">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {dateStr}
          </p>
          <h1 className="text-3xl max-sm:text-2xl font-bold">
            {greeting},{" "}
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

        {/* Popular Companions */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="section-title">Popular Companions</h2>
            <Link href="/companions" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
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

        {/* Recent Sessions + CTA */}
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

      {/* Hero — two column */}
      <section className="flex items-center min-h-[calc(100vh-56px)] px-6 max-sm:px-4 max-md:flex-col max-md:py-16 max-md:gap-10">
        {/* Left column — 60% */}
        <div className="flex flex-col gap-6 w-3/5 max-md:w-full pr-8 max-md:pr-0">
          <div
            className="text-xs px-3 py-1.5 rounded-md font-semibold tracking-wide uppercase w-fit"
            style={{
              backgroundColor: "var(--accent-muted)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
            }}
          >
            Beta — Free to use
          </div>
          <h1
            className="text-5xl max-lg:text-4xl max-sm:text-3xl font-bold leading-[1.1]"
            style={{ letterSpacing: "-0.03em" }}
          >
            Your AI companion
            <br />
            from campus
            <br />
            <span style={{ color: "var(--accent)" }}>to career</span>
          </h1>
          <p className="text-base max-w-lg" style={{ color: "var(--muted-foreground)", lineHeight: "1.6" }}>
            Learn from voice-powered AI companions, prep for interviews, scan your resume, review code — everything you need, in one place.
          </p>
          <div className="flex gap-3 flex-wrap">
            <SignInButton>
              <button className="btn-primary px-6" style={{ height: "44px", fontSize: "15px" }}>
                Get Started Free
              </button>
            </SignInButton>
            <Link href="#features">
              <button className="btn-ghost px-6" style={{ height: "44px", fontSize: "15px", color: "var(--muted-foreground)" }}>
                See how it works
              </button>
            </Link>
          </div>
        </div>

        {/* Right column — 40% abstract CSS/SVG illustration */}
        <div className="w-2/5 max-md:w-full flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[380px]">
            {/* Overlapping geometric shapes */}
            <div
              className="absolute top-[10%] left-[15%] w-[55%] h-[45%] rounded-xl"
              style={{ backgroundColor: "var(--surface-2)", transform: "rotate(-6deg)" }}
            />
            <div
              className="absolute top-[25%] right-[10%] w-[45%] h-[50%] rounded-xl"
              style={{ backgroundColor: "var(--surface-3)", transform: "rotate(4deg)" }}
            />
            <div
              className="absolute bottom-[15%] left-[20%] w-[40%] h-[35%] rounded-full"
              style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)" }}
            />
            {/* Amber accent dots */}
            <div
              className="absolute top-[18%] right-[22%] w-4 h-4 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <div
              className="absolute bottom-[30%] left-[12%] w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--accent)", opacity: 0.6 }}
            />
            <div
              className="absolute top-[55%] right-[15%] w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--accent)", opacity: 0.4 }}
            />
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 100 100">
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="currentColor" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="currentColor" strokeWidth="0.5" />
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section
        className="flex justify-center gap-0 py-6 flex-wrap px-4"
        style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-1)" }}
      >
        {[
          { value: "15", label: "AI Tools" },
          { value: "6", label: "Subjects" },
          { value: "Voice", label: "AI" },
          { value: "Free", label: "Forever" },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1 px-8 max-sm:px-5">
              <span
                className="text-2xl max-sm:text-xl font-bold"
                style={{ color: "var(--accent)", fontFamily: "var(--font-bricolage)", letterSpacing: "-0.02em" }}
              >
                {value}
              </span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div className="w-px h-8" style={{ backgroundColor: "var(--border)" }} />
            )}
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="flex flex-col items-center gap-10 py-20 max-sm:py-14 px-6 max-sm:px-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2
            className="text-3xl max-sm:text-2xl font-bold"
            style={{ letterSpacing: "-0.02em" }}
          >
            Everything you need to get ahead
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            From acing interviews to understanding research papers
          </p>
        </div>

        {/* Two large feature cards */}
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 w-full max-w-4xl">
          {/* AI Companions card */}
          <div
            className="p-6 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <span className="text-3xl">🤖</span>
            <h3 className="text-xl max-sm:text-lg font-bold">AI Companions</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Create personalized AI tutors for any subject. Have real voice conversations that adapt to your learning style.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {["Maths", "Science", "Coding", "History", "Language", "Economics"].map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--muted-foreground)" }}>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* AI Tools card */}
          <div
            className="p-6 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
            }}
          >
            <span className="text-3xl">🛠️</span>
            <h3 className="text-xl max-sm:text-lg font-bold">15 AI Tools</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Practical tools for your career and academics — ATS scanner, resume builder, code reviewer, and more.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {featuredTools.map((tool) => (
                <span key={tool.id} className="text-xs px-2 py-1.5 rounded-md text-center"
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
        <h2
          className="text-3xl max-sm:text-2xl font-bold"
          style={{ letterSpacing: "-0.02em" }}
        >
          Ready to get started?
        </h2>
        <p style={{ color: "var(--muted-foreground)" }}>Free to use. No credit card required.</p>
        <SignInButton>
          <button className="btn-primary px-8" style={{ height: "44px", fontSize: "15px" }}>
            Start for Free →
          </button>
        </SignInButton>
      </section>

    </main>
  );
};

export default Page;