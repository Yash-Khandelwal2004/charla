import Link from "next/link";

const NotFound = () => {
  return (
    <main className="items-center justify-center min-h-[calc(100vh-56px)]">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1
          className="text-8xl max-sm:text-6xl font-bold"
          style={{
            color: "var(--accent)",
            fontFamily: "var(--font-bricolage)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <p
          className="text-lg max-sm:text-base"
          style={{ color: "var(--muted-foreground)" }}
        >
          This page went on a career break.
        </p>
        <Link href="/">
          <button className="btn-primary px-6" style={{ height: "44px" }}>
            Back to Home
          </button>
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
