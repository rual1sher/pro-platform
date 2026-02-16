import { Trash } from "lucide-react";
import { useState } from "react";
import { remove } from "../../../service/task.service";
import { useTask } from "../../../store/task.store";

export function RemoveTask({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const { setTasks, tasks } = useTask();

  const handleClose = () => {
    setOpen(false);
  };

  const handleRemove = () => {
    setTasks(tasks.filter((t) => t.id !== id));
    remove(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 border border-gray-700 rounded-lg hover:bg-gray-700/30 cursor-pointer disabled:bg-transparent disabled:cursor-no-drop"
      >
        <Trash color="rgb(250,50,50)" size={18} />
      </button>
      {open && (
        <div className="bg-gray-800 p-3 rounded-lg absolute bottom right-0 z-10">
          <p className="font-light text-sm mb-2">
            Вы уверены, что хотите удалить задачу
          </p>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleClose}
              className="px-3 py-2 text-sm rounded-lg cursor-pointer bg-gray-700"
            >
              отменить
            </button>
            <button
              onClick={handleRemove}
              className="px-3 py-2 text-sm rounded-lg cursor-pointer bg-red-500"
            >
              удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
