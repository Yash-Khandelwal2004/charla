// app/loading.tsx

import Image from "next/image";

export default function Loading() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: "var(--bg-base)", zIndex: 9999 }}
    >
      {/* Top progress bar */}
      <div
        className="absolute top-0 left-0 h-[2px]"
        style={{
          backgroundColor: "var(--accent)",
          animation: "loadingBar 1.5s ease-in-out forwards",
        }}
      />

      {/* Breathing logo */}
      <div
        style={{
          animation: "breathe 2s ease-in-out infinite",
        }}
      >
        <Image
          src="/images/logo.svg"
          alt="Charla"
          width={48}
          height={48}
          priority
        />
      </div>

      <span
        className="text-sm font-semibold"
        style={{
          color: "var(--text-secondary)",
          fontFamily: "var(--font-bricolage)",
          letterSpacing: "-0.01em",
        }}
      >
        charla
      </span>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.85; }
        }
        @keyframes loadingBar {
          0% { width: 0%; }
          100% { width: 75%; }
        }
      `}</style>
    </div>
  );
}