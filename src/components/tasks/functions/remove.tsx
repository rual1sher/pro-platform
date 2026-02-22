import { Trash, X } from "lucide-react";
import { remove } from "../../../service/task.service";
import { useTask } from "../../../store/task.store";
import { useRef } from "react";
import { Button } from "../../helper/button";

export function RemoveTask({ id }: { id: number }) {
  const { setTasks, tasks } = useTask();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = () => {
    dialogRef.current?.close();
  };

  const handleShow = () => {
    dialogRef.current?.showModal();
  };

  const handleRemove = () => {
    setTasks(tasks.filter((t) => t.id !== id));
    remove(id);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleShow}
        size="sm"
        className="rounded-lg!"
        variant="ghost"
      >
        <Trash color="rgb(250,50,50)" size={18} />
      </Button>

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="bg-transparent p-0 border-0 outline-none max-w-none w-full h-full max-h-none m-0 overflow-hidden"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10" />

        <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/50 text-white w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                <Trash className="text-red-400" size={36} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Удалить задачу?
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Это действие нельзя отменить
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="danger" onClick={handleRemove}>
                <Trash size={18} />
                Удалить
              </Button>
              <Button onClick={handleClose}>
                <X className="w-5 h-5" />
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
