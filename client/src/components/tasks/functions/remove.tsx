import { Trash, X } from "lucide-react";
import { useRef } from "react";
import { remove } from "../../../service/task.service";
import { useTask } from "../../../store/task.store";
import { Button } from "../../ui/button";

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
      <Button onClick={handleShow} size="sm" className="rounded-lg!" variant="ghost">
        <Trash color="rgb(250,50,50)" size={18} />
      </Button>

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="bg-transparent p-0 border-0 outline-none max-w-none w-full h-full max-h-none m-0 overflow-hidden"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10" />

        <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-6 shadow-xl text-[var(--text-primary)] w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--status-error)]/15 border border-[var(--status-error)]/30 flex items-center justify-center mx-auto mb-4">
                <Trash className="text-[var(--status-error)]" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Удалить задачу?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Это действие нельзя отменить
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="danger" onClick={handleRemove}>
                <Trash size={18} />
                Удалить
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="!border-[var(--border-light)] !text-[var(--text-primary)] hover:!bg-[var(--bg-overlay)]"
              >
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
