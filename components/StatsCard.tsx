import Image from "next/image";

interface StatsCardProps {
  icon?: string;
  emoji?: string;
  value: number | string;
  label: string;
}

const StatsCard = ({ icon, emoji, value, label }: StatsCardProps) => {
  return (
    <div className="stat-card min-w-[110px]">
      <div className="flex items-center gap-2">
        {icon ? (
          <Image src={icon} alt={label} width={18} height={18} />
        ) : emoji ? (
          <span className="text-base">{emoji}</span>
        ) : null}
        <p
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-bricolage)", letterSpacing: "-0.02em" }}
        >
          {value}
        </p>
      </div>
      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </p>
    </div>
  );
};

export default StatsCard;
