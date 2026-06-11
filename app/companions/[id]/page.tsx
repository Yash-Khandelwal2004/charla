import { getCompanion } from "@/lib/actions/companion.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSubjectColor } from "@/lib/utils";
import Image from "next/image";
import CompanionComponent from "@/components/CompanionComponent";

interface CompanionSessionPageProps {
  params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = await params;
  const companion = await getCompanion(id);
  const user = await currentUser();

  if (!user) redirect('/sign-in');
  if (!companion?.name) redirect('/companions');

  const { name, subject, topic, duration } = companion;
  const subjectColor = getSubjectColor(subject);

  return (
    <main>
      {/* Session header */}
      <article
        className="flex justify-between items-center p-5 max-md:flex-col max-md:gap-4 max-md:items-start"
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Subject icon */}
          <div
            className="size-[56px] flex items-center justify-center rounded-lg flex-shrink-0 max-md:hidden"
            style={{
              backgroundColor: `${subjectColor}18`,
              border: `1px solid ${subjectColor}30`,
            }}
          >
            <Image src={`/icons/${subject}.svg`} alt={subject} width={28} height={28} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="font-bold text-xl"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-bricolage)",
                  letterSpacing: "-0.02em",
                }}
              >
                {name}
              </p>
              <span
                className="text-xs px-2 py-0.5 rounded-md capitalize max-sm:hidden"
                style={{
                  backgroundColor: `${subjectColor}18`,
                  color: subjectColor,
                  border: `1px solid ${subjectColor}30`,
                }}
              >
                {subject}
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {topic}
            </p>
          </div>
        </div>

        {/* Duration */}
        <div
          className="flex items-center gap-1.5 max-md:hidden"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Image src="/icons/clock.svg" alt="duration" width={14} height={14} />
          <span className="text-sm">{duration} minutes</span>
        </div>
      </article>

      {/* Voice session */}
      <CompanionComponent
        {...companion}
        companionId={id}
        userName={user.firstName!}
        userImage={user.imageUrl!}
      />
    </main>
  );
};

export default CompanionSession;