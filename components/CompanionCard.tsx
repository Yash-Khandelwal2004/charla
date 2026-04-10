"use client";
import { removeBookmark, addBookmark } from "@/lib/actions/companion.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked: boolean;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}: CompanionCardProps) => {
  const pathname = usePathname();

  const handleBookmark = async () => {
    if (bookmarked) {
      await removeBookmark(id, pathname);
    } else {
      await addBookmark(id, pathname);
    }
  };

  return (
    <article
      className="companion-card group"
      style={{ borderLeftColor: color }}
    >
      <div className="flex justify-between items-center">
        {/* Subject badge with small colored dot */}
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md capitalize font-medium"
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--surface-3)",
            color: color,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          {subject}
        </span>
        <button
          className="companion-bookmark"
          onClick={handleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Image
            src={bookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
            alt="bookmark"
            width={13}
            height={15}
          />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <h2
          className="text-lg font-bold leading-tight"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-bricolage)" }}
        >
          {name}
        </h2>
        <p className="text-sm line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
          {topic}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Image
            src="/icons/clock.svg"
            alt="duration"
            width={13}
            height={13}
            className="opacity-50"
          />
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {duration} min
          </span>
        </div>

        <Link href={`/companions/${id}`}>
          <button className="btn-primary text-xs py-1.5">
            Launch →
          </button>
        </Link>
      </div>
    </article>
  );
};

export default CompanionCard;