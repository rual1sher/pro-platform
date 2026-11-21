import { useDroppable } from "@dnd-kit/react";

interface ColumnProps {
  children?: React.ReactNode;
  id: string;
  title: string;
  count: number;
  color?: string;
  badgeBg?: string;
}

export function Column({ children, id, title, count }: ColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: `column-${id}`,
    collisionPriority: 1,
  });

  return (
    <div className="flex-1 min-w-[270px] md:min-w-[290px] max-w-full" ref={ref}>
      <div
        className={`rounded-2xl p-3 flex flex-col transition-all duration-150 border shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] ${
          isDropTarget
            ? "bg-[var(--bg-overlay)] border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/30 shadow-lg"
            : "bg-[var(--bg-surface)] border-[var(--border-light)]"
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between px-3 py-2 mb-2.5 rounded-xl bg-[var(--bg-overlay)]/60 border border-[var(--border-light)]">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                id === "0"
                  ? "bg-[var(--text-disabled)]"
                  : id === "1"
                    ? "bg-[var(--status-info)]"
                    : id === "2"
                      ? "bg-[var(--status-success)]"
                      : "bg-[var(--status-error)]"
              }`}
            ></div>
            <h3 className="font-semibold text-xs text-[var(--text-primary)] tracking-wider uppercase">
              {title}
            </h3>
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-light)]">
            {count}
          </span>
        </div>

        {/* Task Cards Dropzone */}
        <div className="flex-1 min-h-[400px] max-h-[calc(100vh-290px)] overflow-y-auto pr-1 space-y-2.5">
          {children}
          {count === 0 && (
            <div className="h-28 flex flex-col items-center justify-center border border-dashed border-[var(--border-light)] rounded-xl text-[var(--text-disabled)] text-xs font-medium">
              <span>Перетащите задачу сюда</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
