
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import { getUserToolUsage, getUserToolCount } from "@/lib/actions/tools.actions";
import { getUserInterviews } from "@/lib/actions/interview.actions";
import { scoreColor, verdictFor } from "@/lib/interview/scoring";
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";
import { tools } from "@/constants";

const RECENT_INTERVIEWS_SHOWN = 5;

const Profile = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [
    companions,
    sessionHistory,
    bookmarkedCompanions,
    toolUsage,
    toolCount,
    interviews,
  ] = await Promise.all([
    getUserCompanions(user.id),
    getUserSessions(user.id),
    getBookmarkedCompanions(user.id),
    getUserToolUsage(20),
    getUserToolCount(),
    getUserInterviews(100),
  ]);

  // Interview stats: only interviews that produced a score count toward the numbers.
  const scored = interviews.filter(
    (i) => i.status === "completed" && i.score !== null,
  );
  const bestScore = scored.length
    ? Math.max(...scored.map((i) => i.score as number))
    : null;
  const averageScore = scored.length
    ? Math.round(
        scored.reduce((sum, i) => sum + (i.score as number), 0) / scored.length,
      )
    : null;
  const recentInterviews = interviews.slice(0, RECENT_INTERVIEWS_SHOWN);

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

  const statCards = [
    {
      icon: "/icons/check.svg",
      value: sessionHistory.length,
      label: "Lessons completed",
    },
    {
      icon: "/icons/cap.svg",
      value: companions.length,
      label: "Companions created",
    },
    {
      emoji: "🔧",
      value: toolCount,
      label: "Tools used",
    },
    {
      emoji: "🎤",
      value: scored.length,
      label: "Interviews scored",
    },
    {
      emoji: "🔖",
      value: bookmarkedCompanions.length,
      label: "Bookmarked",
    },
  ];

  return (
    <main>
      {/* Profile Header */}
      <section className="flex justify-between gap-6 max-sm:flex-col items-start">
        <div className="flex gap-4 items-center">
          <Image
            src={user.imageUrl}
            alt={user.firstName!}
            width={80}
            height={80}
            className="rounded-lg"
          />
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-2xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {user.emailAddresses[0].emailAddress}
            </p>
            <Link href="/subscription">
              <span
                className="text-xs px-2 py-0.5 rounded-md font-medium mt-1 inline-block"
                style={{
                  backgroundColor: "var(--accent-muted)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                }}
              >
                Manage Plan →
              </span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 flex-wrap">
          {statCards.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Accordions */}
      <Accordion type="multiple" defaultValue={["tools"]}>

        {/* Tool Usage History */}
        <AccordionItem value="tools" style={{ borderColor: "var(--border)" }}>
          <AccordionTrigger
            className="text-xl font-semibold hover:no-underline"
            style={{ color: "var(--foreground)" }}
          >
            <div className="flex items-center gap-2">
              <span>🔧</span>
              <span>Tool History</span>
              <span
                className="text-xs px-2 py-0.5 rounded-md font-normal ml-1"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--muted-foreground)",
                }}
              >
                {toolUsage.length}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {toolUsage.length === 0 ? (
              <div
                className="p-8 flex flex-col items-center gap-2 text-center"
                style={{
                  backgroundColor: "var(--surface-1)",
                  border: "1px dashed var(--border)",
                  borderRadius: "10px",
                }}
              >
                <span className="text-3xl">🔧</span>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No tools used yet.{" "}
                  <Link href="/tools" style={{ color: "var(--accent)" }}>
                    Browse tools →
                  </Link>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                {toolUsage.map((usage) => {
                  const meta = getToolMeta(usage.tool_name);
                  return (
                    <Link href={`/tools/${usage.tool_name}`} key={usage.id}>
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-lg group"
                        style={{
                          backgroundColor: "var(--surface-1)",
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{meta.icon}</span>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                              {meta.label}
                            </p>
                            <p
                              className="text-xs line-clamp-1 max-w-[400px]"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {usage.output.slice(0, 80)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-md capitalize"
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
                            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "var(--accent)" }}
                          >
                            Use again →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Mock Interviews */}
        <AccordionItem value="interviews" style={{ borderColor: "var(--border)" }}>
          <AccordionTrigger
            className="text-xl font-semibold hover:no-underline"
            style={{ color: "var(--foreground)" }}
          >
            <div className="flex items-center gap-2">
              <span>🎤</span>
              <span>Mock Interviews</span>
              <span
                className="text-xs px-2 py-0.5 rounded-md font-normal ml-1"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--muted-foreground)",
                }}
              >
                {scored.length}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {recentInterviews.length === 0 ? (
              <div
                className="p-8 flex flex-col items-center gap-2 text-center"
                style={{
                  backgroundColor: "var(--surface-1)",
                  border: "1px dashed var(--border)",
                  borderRadius: "10px",
                }}
              >
                <span className="text-3xl">🎤</span>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No interviews yet.{" "}
                  <Link href="/interview" style={{ color: "var(--accent)" }}>
                    Start a mock interview →
                  </Link>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                {bestScore !== null && averageScore !== null && (
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Best score{" "}
                    <strong style={{ color: scoreColor(bestScore) }}>{bestScore}</strong>
                    {" · "}Average{" "}
                    <strong style={{ color: scoreColor(averageScore) }}>{averageScore}</strong>
                    {" · "}
                    {scored.length} scored
                  </p>
                )}

                {recentInterviews.map((interview) => {
                  const isScored =
                    interview.status === "completed" && interview.score !== null;
                  const color = isScored ? scoreColor(interview.score as number) : undefined;
                  return (
                    <Link href={`/interview/${interview.id}`} key={interview.id}>
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-lg group"
                        style={{
                          backgroundColor: "var(--surface-1)",
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎤</span>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                              {interview.job_title}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                              {formatDate(interview.created_at)} · {interview.duration_minutes} min
                              {interview.status === "in_progress" ? " · interrupted" : ""}
                              {interview.status === "assessment_failed" ? " · assessment pending" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isScored ? (
                            <span className="text-xs font-semibold" style={{ color }}>
                              {verdictFor(interview.score as number)}
                            </span>
                          ) : null}
                          <span
                            className="text-sm font-bold px-2.5 py-0.5 rounded-md min-w-[2.75rem] text-center"
                            style={{
                              backgroundColor: "var(--surface-2)",
                              color: color ?? "var(--muted-foreground)",
                              border: `1px solid ${color ?? "var(--border)"}`,
                            }}
                          >
                            {isScored ? interview.score : "—"}
                          </span>
                          <span
                            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "var(--accent)" }}
                          >
                            {interview.status === "completed" ? "View report →" : "Open →"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                <div className="flex justify-between items-center pt-1">
                  <Link href="/history" className="text-xs" style={{ color: "var(--accent)" }}>
                    Transcripts and recommendations in History →
                  </Link>
                  <Link href="/interview" className="text-xs" style={{ color: "var(--accent)" }}>
                    New interview →
                  </Link>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Bookmarked Companions */}
        <AccordionItem value="bookmarks" style={{ borderColor: "var(--border)" }}>
          <AccordionTrigger
            className="text-xl font-semibold hover:no-underline"
            style={{ color: "var(--foreground)" }}
          >
            <div className="flex items-center gap-2">
              <span>🔖</span>
              <span>Bookmarked Companions</span>
              <span
                className="text-xs px-2 py-0.5 rounded-md font-normal ml-1"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--muted-foreground)",
                }}
              >
                {bookmarkedCompanions.length}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList
              companions={bookmarkedCompanions}
              title="Bookmarked Companions"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Recent Sessions */}
        <AccordionItem value="recent" style={{ borderColor: "var(--border)" }}>
          <AccordionTrigger
            className="text-xl font-semibold hover:no-underline"
            style={{ color: "var(--foreground)" }}
          >
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span>Recent Sessions</span>
              <span
                className="text-xs px-2 py-0.5 rounded-md font-normal ml-1"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--muted-foreground)",
                }}
              >
                {sessionHistory.length}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList title="Recent Sessions" companions={sessionHistory} />
          </AccordionContent>
        </AccordionItem>

        {/* My Companions */}
        <AccordionItem value="companions" style={{ borderColor: "var(--border)" }}>
          <AccordionTrigger
            className="text-xl font-semibold hover:no-underline"
            style={{ color: "var(--foreground)" }}
          >
            <div className="flex items-center gap-2">
              <span>🤖</span>
              <span>My Companions</span>
              <span
                className="text-xs px-2 py-0.5 rounded-md font-normal ml-1"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--muted-foreground)",
                }}
              >
                {companions.length}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList title="My Companions" companions={companions} />
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </main>
  );
};

export default Profile;