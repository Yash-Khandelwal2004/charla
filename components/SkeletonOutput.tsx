const SkeletonOutput = () => {
  return (
    <div
      className="flex flex-col gap-4 p-6"
      style={{
        backgroundColor: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
      }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="skeleton w-2 h-2 rounded-full" />
          <div className="skeleton w-16 h-4" />
        </div>
        <div className="skeleton w-14 h-7 rounded-md" />
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ backgroundColor: "var(--border)" }} />

      {/* Content skeleton lines */}
      <div className="flex flex-col gap-3">
        <div className="skeleton w-3/4 h-5" />
        <div className="skeleton w-full h-4" />
        <div className="skeleton w-full h-4" />
        <div className="skeleton w-5/6 h-4" />
        <div className="skeleton w-2/3 h-5 mt-2" />
        <div className="skeleton w-full h-4" />
        <div className="skeleton w-4/5 h-4" />
        <div className="skeleton w-full h-4" />
        <div className="skeleton w-3/4 h-4" />
        <div className="skeleton w-1/2 h-5 mt-2" />
        <div className="skeleton w-full h-4" />
        <div className="skeleton w-2/3 h-4" />
      </div>
    </div>
  );
};

export default SkeletonOutput;
