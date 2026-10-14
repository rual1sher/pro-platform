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
    id,
  });

  return (
    <div className="flex-1 min-w-[270px] md:min-w-[290px] max-w-full" ref={ref}>
      <div
        className={`rounded-[28px] p-3.5 flex flex-col transition-all duration-200 border ${
          isDropTarget
            ? "bg-[#252525] border-[#BB86FC] ring-2 ring-[#BB86FC]/30 shadow-lg"
            : "bg-[#1E1E1E] border-[#2C2C2C]"
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 mb-2.5 rounded-2xl bg-[#252525] border border-[#2C2C2C] shadow-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                id === "0"
                  ? "bg-[#757575]"
                  : id === "1"
                  ? "bg-[#2196F3]"
                  : id === "2"
                  ? "bg-[#4CAF50]"
                  : "bg-[#CF6679]"
              }`}
            ></div>
            <h3 className="font-extrabold text-xs text-[#E3E3E3] tracking-wide uppercase">
              {title}
            </h3>
          </div>

          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#1E1E1E] text-[#BB86FC] border border-[#2C2C2C]">
            {count}
          </span>
        </div>

        {/* Task Cards Dropzone */}
        <div className="flex-1 min-h-[400px] max-h-[calc(100vh-290px)] overflow-y-auto pr-1 space-y-2.5">
          {children}
          {count === 0 && (
            <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-[#2C2C2C] rounded-2xl text-[#616161] text-xs font-medium">
              <span>Перетащите задачу сюда</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
