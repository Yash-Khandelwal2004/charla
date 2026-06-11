const Loading = () => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo mark with pulse animation */}
        <div
          className="w-12 h-12 flex items-center justify-center rounded-lg text-sm font-bold"
          style={{
            backgroundColor: "var(--accent)",
            color: "#1a1917",
            fontFamily: "var(--font-bricolage)",
            letterSpacing: "-0.03em",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        >
          CH
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Loading;
