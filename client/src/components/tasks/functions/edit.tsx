import { useState, useEffect } from "react";
import type { ITaskResponce, ITaskRequest } from "../../../types";
import { X } from "lucide-react";
import { update } from "../../../service/task.service";
import { useTask } from "../../../store/task.store";
import { Button } from "../../helper/button";

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

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[32px] w-full max-w-lg p-6 shadow-2xl space-y-5 text-[#E3E3E3]">
        <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
          <h2 className="text-lg font-extrabold text-[#E3E3E3]">Редактировать задачу</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9E9E9E] hover:text-[#E3E3E3] rounded-full hover:bg-[#252525] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#E3E3E3] mb-1 uppercase tracking-wider">
              Заголовок *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-2xl text-[#E3E3E3] placeholder-[#616161] focus:outline-none focus:border-[#BB86FC] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E3E3E3] mb-1 uppercase tracking-wider">
              Описание
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-2xl text-[#E3E3E3] placeholder-[#616161] focus:outline-none focus:border-[#BB86FC] transition-colors text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#E3E3E3] mb-1 uppercase tracking-wider">
                Исполнитель (Воркер)
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-[#E3E3E3] text-xs font-medium focus:outline-none focus:border-[#BB86FC]"
              >
                <option value="">Не назначен</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} ({m.role === "OWNER" ? "Владелец" : "Воркер"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E3E3E3] mb-1 uppercase tracking-wider">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-[#E3E3E3] text-xs font-medium focus:outline-none focus:border-[#BB86FC]"
              >
                <option value="0">🟢 Низкий (#81C784)</option>
                <option value="1">🟡 Средний (#FFB74D)</option>
                <option value="2">🔴 Высокий (#FF5252)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#E3E3E3] mb-1 uppercase tracking-wider">
                Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-[#E3E3E3] text-xs font-medium focus:outline-none focus:border-[#BB86FC]"
              >
                <option value="0">Ожидает</option>
                <option value="1">В работе</option>
                <option value="2">Готово</option>
                <option value="3">Отклонено</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E3E3E3] mb-1 uppercase tracking-wider">
                Срок (Дедлайн)
              </label>
              <input
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-[#E3E3E3] placeholder-[#616161] text-xs font-medium focus:outline-none focus:border-[#BB86FC]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#2C2C2C]">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !title.trim()}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
