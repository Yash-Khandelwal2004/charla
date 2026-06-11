import {getAllCompanions} from "@/lib/actions/companion.actions";
import CompanionCard from "@/components/CompanionCard";
import {getSubjectColor} from "@/lib/utils";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import Link from "next/link";

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
    const filters = await searchParams;
    const subject = filters.subject ? filters.subject : '';
    const topic = filters.topic ? filters.topic : '';

    const companions = await getAllCompanions({ subject, topic });

    return (
        <main>
            <section className="flex justify-between gap-4 max-sm:flex-col">
                <div className="flex flex-col gap-1">
                    <h1>Companion Library</h1>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                        Browse and start voice sessions with AI companions
                    </p>
                </div>
                <Link href="/companions/new">
                    <button className="btn-primary">New Companion</button>
                </Link>
            </section>

            <div className="flex gap-4 flex-wrap">
                <SearchInput />
                <SubjectFilter />
            </div>

            <section className="companions-grid">
                {companions.length === 0 ? (
                    <div
                        className="col-span-full flex flex-col items-center gap-3 py-16 text-center"
                        style={{
                            backgroundColor: "var(--surface-1)",
                            border: "1px dashed var(--border)",
                            borderRadius: "10px",
                        }}
                    >
                        <span className="text-4xl">🔍</span>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                            No companions found matching your filters
                        </p>
                        <Link href="/companions/new">
                            <button className="btn-primary text-xs">Create One →</button>
                        </Link>
                    </div>
                ) : (
                    companions.map((companion) => (
                        <CompanionCard
                            key={companion.id}
                            {...companion}
                            color={getSubjectColor(companion.subject)}
                        />
                    ))
                )}
            </section>
        </main>
    )
}

export default CompanionsLibrary
