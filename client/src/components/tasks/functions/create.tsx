import { useEffect, useState } from "react";
import type { ITaskRequest } from "../../../types";
import { Plus, X, Building2 } from "lucide-react";
import { create } from "../../../service/task.service";
import { useAuth } from "../../../store/auth.store";
import { useTask } from "../../../store/task.store";
import { Button } from "../../helper/button";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const [loader, setLoader] = useState(false);
  const { user, activeOrg } = useAuth();
  const { addTask, members } = useTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("1"); // 0: low, 1: med, 2: high
  const [status, setStatus] = useState("0"); // 0: backlog, 1: in-progress, 2: done, 3: rejected
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState(new Date().toLocaleDateString("ru-RU"));

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setPriority("1");
      setStatus("0");
      setAssigneeId(user?.id || "");
      setDueDate(new Date().toLocaleDateString("ru-RU"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoader(true);
    const data: ITaskRequest = {
      title,
      description,
      priority,
      preority: priority,
      status,
      order: status,
      date: dueDate,
      dueDate,
      organizationId: activeOrg?.id,
      assigneeId: assigneeId ? Number(assigneeId) : undefined,
      user_id: assigneeId ? Number(assigneeId) : undefined,
    };

    const res = await create(data);
    if (res) {
      addTask(res);
      onClose();
    }
    setLoader(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[32px] w-full max-w-lg p-6 shadow-2xl space-y-5 text-[#E3E3E3]">
        <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#E3E3E3]">Новая задача</h2>
            {activeOrg && (
              <p className="text-xs text-[#03DAC6] font-semibold flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} />
                Организация: {activeOrg.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9E9E9E] hover:text-[#E3E3E3] rounded-full hover:bg-[#252525] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#E3E3E3] mb-1 uppercase tracking-wider">
              Название задачи *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Что необходимо сделать?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-2xl text-[#E3E3E3] placeholder-[#616161] focus:outline-none focus:border-[#BB86FC] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E3E3E3] mb-1 uppercase tracking-wider">
              Описание задачи
            </label>
            <textarea
              rows={3}
              placeholder="Подробности, контекст, ссылки..."
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
                    {m.name} {m.userId === user?.id ? "(Вы)" : ""}
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
            <Button type="button" variant="ghost" onClick={onClose} disabled={loader}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={loader || !title.trim()}>
              {loader ? "Создание..." : "Создать задачу"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateTask() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#BB86FC] hover:bg-[#a871ea] text-[#121212] rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-98 transition-all"
      >
        <Plus size={15} strokeWidth={2.5} />
        <span>Новая задача</span>
      </button>

      <CreateTaskModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
