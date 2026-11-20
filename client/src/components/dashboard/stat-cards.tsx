import type { ITaskStats, IStatCardItem } from "../../types";

export type { IStatCardItem };

export const STAT_CARDS: readonly IStatCardItem[] = [
  {
    key: "pending",
    label: "Ожидает",
    color: "var(--text-disabled)",
    dot: "bg-[var(--text-disabled)]",
  },
  {
    key: "inProgress",
    label: "В работе",
    color: "var(--status-info)",
    dot: "bg-[var(--status-info)]",
  },
  {
    key: "done",
    label: "Готово",
    color: "var(--status-success)",
    dot: "bg-[var(--status-success)]",
  },
  {
    key: "rejected",
    label: "Отклонено",
    color: "var(--status-error)",
    dot: "bg-[var(--status-error)]",
  },
] as const;

interface StatCardProps {
  card: IStatCardItem;
  value: number;
}

export function StatCard({ card, value }: StatCardProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-4 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)]">
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        <span className={`w-2 h-2 rounded-full ${card.dot}`}></span>
        {card.label}
      </span>
      <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

interface StatCardsProps {
  stats: ITaskStats;
  className?: string;
}

export function StatCards({
  stats,
  className = "grid grid-cols-2 md:grid-cols-4 gap-3.5",
}: StatCardsProps) {
  return (
    <div className={className}>
      {STAT_CARDS.map((card) => (
        <StatCard key={card.key} card={card} value={stats[card.key]} />
      ))}
    </div>
  );
}
