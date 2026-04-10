import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn, getSubjectColor } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface CompanionsListProps {
  title: string;
  companions?: Companion[];
  classNames?: string;
}

const CompanionsList = ({ title, companions, classNames }: CompanionsListProps) => {
  if (!companions || companions.length === 0) {
    return (
      <article className={cn("companion-list", classNames)}>
        <h2 className="font-bold text-xl mb-4" style={{ fontFamily: "var(--font-bricolage)" }}>{title}</h2>
        <div
          className="rounded-lg p-8 flex flex-col items-center gap-2 text-center"
          style={{ backgroundColor: "var(--surface-2)", border: "1px dashed var(--surface-3)" }}
        >
          <span className="text-3xl">🤖</span>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No companions here yet</p>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("companion-list", classNames)}>
      <h2 className="font-bold text-xl mb-4" style={{ fontFamily: "var(--font-bricolage)" }}>{title}</h2>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "var(--surface-3)" }}>
            <TableHead className="text-sm font-medium w-2/3" style={{ color: "var(--muted-foreground)" }}>
              Lesson
            </TableHead>
            <TableHead className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              Subject
            </TableHead>
            <TableHead className="text-sm font-medium text-right" style={{ color: "var(--muted-foreground)" }}>
              Duration
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companions.map(({ id, subject, name, topic, duration }) => {
            const color = getSubjectColor(subject);
            return (
              <TableRow
                key={id}
                style={{ borderColor: "var(--surface-3)" }}
                className="transition-colors duration-150"
              >
                <TableCell>
                  <Link href={`/companions/${id}`}>
                    <div className="flex items-center gap-3">
                      {/* Subject icon with small left border accent */}
                      <div
                        className="size-[48px] flex items-center justify-center rounded-lg max-md:hidden flex-shrink-0"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        <Image
                          src={`/icons/${subject}.svg`}
                          alt={subject}
                          width={24}
                          height={24}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                          {name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {topic}
                        </p>
                      </div>
                    </div>
                  </Link>
                </TableCell>

                <TableCell>
                  {/* Desktop badge with colored dot */}
                  <span
                    className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md capitalize font-medium max-md:hidden"
                    style={{
                      backgroundColor: "var(--surface-2)",
                      color: color,
                      border: "1px solid var(--surface-3)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {subject}
                  </span>
                  {/* Mobile icon */}
                  <div
                    className="flex items-center justify-center rounded-lg w-fit p-1.5 md:hidden"
                    style={{ backgroundColor: "var(--surface-2)" }}
                  >
                    <Image src={`/icons/${subject}.svg`} alt={subject} width={16} height={16} />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 w-full justify-end">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {duration}
                      <span className="max-md:hidden" style={{ color: "var(--muted-foreground)" }}> mins</span>
                    </p>
                    <Image src="/icons/clock.svg" alt="minutes" width={12} height={12} className="md:hidden opacity-50" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </article>
  );
};

export default CompanionsList;