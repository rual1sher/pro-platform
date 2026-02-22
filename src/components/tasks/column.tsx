import { useDroppable } from "@dnd-kit/react";

export function Column({
  children,
  id,
  title,
  count,
  color,
}: {
  children?: React.ReactNode;
  id: string;
  title: string;
  count: number;
  color: string;
}) {
  const { ref, isDropTarget } = useDroppable({
    id,
  });

  return (
    <div className="flex-1 md:min-w-90 overflow-auto" ref={ref}>
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          <span className="bg-gray-700/50 text-gray-400 text-xs px-2 py-1 rounded-full ml-auto">
            {count}
          </span>
        </div>
        <div
          className={`h-125 md:h-170 overflow-auto ${isDropTarget ? "bg-gray-800/50" : ""}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
