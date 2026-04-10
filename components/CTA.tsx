import Image from "next/image";
import Link from "next/link";

const Cta = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">Start learning your way</div>
      <h2 className="text-2xl font-bold leading-snug" style={{ fontFamily: "var(--font-bricolage)" }}>
        Build a Personalized Learning Companion
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        Pick a name, subject, voice, and personality — then learn through voice conversations that feel natural and fun.
      </p>
      <Image
        src="/images/cta.svg"
        alt="cta"
        width={300}
        height={200}
        className="opacity-80"
      />
      <Link href="/companions/new" className="w-full">
        <button className="btn-primary w-full justify-center py-2.5">
          <Image src="/icons/plus.svg" alt="plus" width={12} height={12} />
          Build a New Companion
        </button>
      </Link>
    </section>
  );
};

export default Cta;