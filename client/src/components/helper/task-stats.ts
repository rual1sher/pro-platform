import type { ITaskResponce, ITaskStats } from "../../types";

export type { ITaskStats };

export function computeTaskStats(tasks: ITaskResponce[]): ITaskStats {
  const total = tasks.length || 1;
  const countByOrder = (order: string) =>
    tasks.filter((t) => String(t.order ?? t.status) === order).length;

  const pending = countByOrder("0");
  const inProgress = countByOrder("1");
  const done = countByOrder("2");
  const rejected = countByOrder("3");

  return {
    total: tasks.length,
    pending,
    inProgress,
    done,
    rejected,
    pendingPct: Math.round((pending / total) * 100),
    inProgressPct: Math.round((inProgress / total) * 100),
    donePct: Math.round((done / total) * 100),
    rejectedPct: Math.round((rejected / total) * 100),
  };
}
