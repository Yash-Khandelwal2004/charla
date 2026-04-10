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
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";
import Link from "next/link";
import { tools } from "@/constants";

const Profile = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [companions, sessionHistory, bookmarkedCompanions, toolUsage, toolCount] =
    await Promise.all([
      getUserCompanions(user.id),
      getUserSessions(user.id),
      getBookmarkedCompanions(user.id),
      getUserToolUsage(20),
      getUserToolCount(),
    ]);

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
            <div key={i} className="stat-card min-w-[110px]">
              <div className="flex items-center gap-2">
                {stat.icon ? (
                  <Image src={stat.icon} alt={stat.label} width={18} height={18} />
                ) : (
                  <span className="text-base">{stat.emoji}</span>
                )}
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Accordions */}
      <Accordion type="multiple" defaultValue={["tools"]}>

        {/* Tool Usage History */}
        <AccordionItem value="tools" style={{ borderColor: "var(--surface-3)" }}>
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
                className="rounded-lg p-8 flex flex-col items-center gap-2 text-center"
                style={{ backgroundColor: "var(--surface-1)", border: "1px dashed var(--surface-3)" }}
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
                          border: "1px solid var(--surface-3)",
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

        {/* Bookmarked Companions */}
        <AccordionItem value="bookmarks" style={{ borderColor: "var(--surface-3)" }}>
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
        <AccordionItem value="recent" style={{ borderColor: "var(--surface-3)" }}>
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
        <AccordionItem value="companions" style={{ borderColor: "var(--surface-3)" }}>
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