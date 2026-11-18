import type { ITaskStats, IStatCardItem } from "../../types";

export type { IStatCardItem };

export const STAT_CARDS: readonly IStatCardItem[] = [
  { key: "pending", label: "Ожидает", color: "#757575", dot: "bg-[#757575]" },
  { key: "inProgress", label: "В работе", color: "#2196F3", dot: "bg-[#2196F3]" },
  { key: "done", label: "Готово", color: "#4CAF50", dot: "bg-[#4CAF50]" },
  { key: "rejected", label: "Отклонено", color: "#CF6679", dot: "bg-[#CF6679]" },
] as const;

interface StatCardProps {
  card: IStatCardItem;
  value: number;
}

export function StatCard({ card, value }: StatCardProps) {
  return (
    <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-2xl p-4 space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#9E9E9E]">
        <span className={`w-2 h-2 rounded-full ${card.dot}`}></span>
        {card.label}
      </span>
      <p className="text-2xl font-black text-[#E3E3E3]">{value}</p>
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
