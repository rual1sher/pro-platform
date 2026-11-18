import { useState, useEffect } from "react";
import type { ITaskResponce, ITaskRequest } from "../../../types";
import { update } from "../../../service/task.service";
import { useTask } from "../../../store/task.store";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";

interface EditTaskModalProps {
  task: ITaskResponce | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskModal({ task, isOpen, onClose }: EditTaskModalProps) {
  const { members, updateTaskInStore } = useTask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("1");
  const [status, setStatus] = useState("0");
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.preority || task.priority || "1");
      setStatus(task.order || task.status || "0");
      setAssigneeId(task.assigneeId || task.user_id || "");
      setDueDate(task.dueDate || task.date || "");
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !task) return;

    setLoading(true);
    const payload: Partial<ITaskRequest> = {
      title,
      description,
      priority,
      preority: priority,
      status,
      order: status,
      assigneeId: assigneeId ? Number(assigneeId) : undefined,
      user_id: assigneeId ? Number(assigneeId) : undefined,
      dueDate,
      date: dueDate,
    };

    const updated = await update(task.id, payload);
    if (updated) {
      updateTaskInStore(task.id, updated);
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактировать задачу</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Заголовок *</Label>
            <Input
              id="edit-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Описание</Label>
            <Textarea
              id="edit-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-assignee">Исполнитель (Воркер)</Label>
              <select
                id="edit-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-[#E3E3E3] text-xs font-medium focus:outline-none focus:border-[#BB86FC] transition-all"
              >
                <option value="">Не назначен</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} ({m.role === "OWNER" ? "Владелец" : "Воркер"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-priority">Приоритет</Label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-[#E3E3E3] text-xs font-medium focus:outline-none focus:border-[#BB86FC] transition-all"
              >
                <option value="0">🟢 Низкий (#81C784)</option>
                <option value="1">🟡 Средний (#FFB74D)</option>
                <option value="2">🔴 Высокий (#FF5252)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-status">Статус</Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-[#E3E3E3] text-xs font-medium focus:outline-none focus:border-[#BB86FC] transition-all"
              >
                <option value="0">Ожидает</option>
                <option value="1">В работе</option>
                <option value="2">Готово</option>
                <option value="3">Отклонено</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-due">Срок (Дедлайн)</Label>
              <Input
                id="edit-due"
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !title.trim()}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
