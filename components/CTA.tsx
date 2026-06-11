import Link from "next/link";
import { Plus } from "lucide-react";

const Cta = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">Start learning your way</div>
      <h2
        className="text-2xl font-bold leading-snug"
        style={{
          fontFamily: "var(--font-bricolage)",
          letterSpacing: "-0.02em",
        }}
      >
        Build a Personalized Learning Companion
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        Pick a name, subject, voice, and personality — then learn through voice
        conversations that feel natural and fun.
      </p>

      {/* CSS geometric illustration */}
      <div className="relative w-full h-32 my-2">
        <div
          className="absolute top-2 left-1/4 w-20 h-20 rounded-lg opacity-20"
          style={{ backgroundColor: "var(--accent)", transform: "rotate(12deg)" }}
        />
        <div
          className="absolute top-6 left-1/3 w-16 h-16 rounded-full opacity-15"
          style={{ backgroundColor: "var(--foreground)" }}
        />
        <div
          className="absolute top-4 right-1/4 w-24 h-14 rounded-lg opacity-10"
          style={{ backgroundColor: "var(--accent)", transform: "rotate(-8deg)" }}
        />
        <div
          className="absolute bottom-2 left-1/2 w-3 h-3 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
        <div
          className="absolute top-8 right-1/3 w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      </div>

      <Link href="/companions/new" className="w-full">
        <button className="btn-primary w-full justify-center py-2.5">
          <Plus size={14} />
          Build a New Companion
        </button>
      </Link>
    </section>
  );
};

export default Cta;