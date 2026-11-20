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
    <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-3.5 space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/15 transition-all">
      <span className="flex items-center gap-1.5 text-xs font-normal text-[var(--text-secondary)]">
        <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`}></span>
        {card.label}
      </span>
      <p className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
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
  className = "grid grid-cols-2 md:grid-cols-4 gap-2.5",
}: StatCardsProps) {
  return (
    <div className={className}>
      {STAT_CARDS.map((card) => (
        <StatCard key={card.key} card={card} value={stats[card.key]} />
      ))}
    </div>
  );
}

/**
 * Modern Linear/Raycast-style unified cycle workload bar.
 * Replaces repetitive boilerplate stat boxes with a high-density, clean overview.
 */
export function WorkloadOverview({ stats }: { stats: ITaskStats }) {
  const isAllEmpty = stats.total === 0;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-3">
      {/* Top summary row */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            Прогресс задач
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            ({stats.total}{" "}
            {stats.total === 1 ? "задача" : stats.total < 5 ? "задачи" : "задач"} всего)
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-[var(--brand-primary)]">
            {stats.donePct}%
          </span>
          <span className="text-xs font-normal text-[var(--text-secondary)]">
            завершено
          </span>
        </div>
      </div>

      {/* Multi-segmented continuous progress bar */}
      <div className="w-full h-2 bg-[var(--bg-overlay)] rounded-full overflow-hidden flex p-0.5 gap-0.5">
        {isAllEmpty ? (
          <div className="w-full h-full bg-[var(--border-light)] rounded-full" />
        ) : (
          <>
            {stats.donePct > 0 && (
              <div
                style={{ width: `${stats.donePct}%` }}
                className="h-full bg-[var(--status-success)] rounded-full transition-all duration-300"
                title={`Готово: ${stats.done} (${stats.donePct}%)`}
              />
            )}
            {stats.inProgressPct > 0 && (
              <div
                style={{ width: `${stats.inProgressPct}%` }}
                className="h-full bg-[var(--status-info)] rounded-full transition-all duration-300"
                title={`В работе: ${stats.inProgress} (${stats.inProgressPct}%)`}
              />
            )}
            {stats.pendingPct > 0 && (
              <div
                style={{ width: `${stats.pendingPct}%` }}
                className="h-full bg-[var(--text-disabled)] rounded-full transition-all duration-300"
                title={`Ожидает: ${stats.pending} (${stats.pendingPct}%)`}
              />
            )}
            {stats.rejectedPct > 0 && (
              <div
                style={{ width: `${stats.rejectedPct}%` }}
                className="h-full bg-[var(--status-error)] rounded-full transition-all duration-300"
                title={`Отклонено: ${stats.rejected} (${stats.rejectedPct}%)`}
              />
            )}
          </>
        )}
      </div>

      {/* Segment legend / metrics breakdown */}
      <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4 pt-1 text-xs">
        {STAT_CARDS.map((card) => {
          const val = stats[card.key];
          const pct = stats[`${card.key}Pct` as const];
          return (
            <div key={card.key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${card.dot}`} />
              <span className="text-[var(--text-secondary)] font-normal">
                {card.label}:
              </span>
              <span className="text-[var(--text-primary)] font-medium">
                {val}{" "}
                <span className="text-[var(--text-disabled)] text-[11px]">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
