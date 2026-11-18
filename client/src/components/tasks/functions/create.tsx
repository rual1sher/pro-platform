import { useEffect, useState } from "react";
import type { ITaskRequest } from "../../../types";
import { Plus, Building2 } from "lucide-react";
import { create } from "../../../service/task.service";
import { useAuth } from "../../../store/auth.store";
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
  const [priority, setPriority] = useState("1");
  const [status, setStatus] = useState("0");
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
  }, [isOpen, user?.id]);

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
          {activeOrg && (
            <p className="text-xs text-[#03DAC6] font-semibold flex items-center gap-1.5 mt-0.5">
              <Building2 size={13} />
              Организация: {activeOrg.name}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Название задачи *</Label>
            <Input
              id="task-title"
              type="text"
              required
              autoFocus
              placeholder="Что необходимо сделать?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Описание задачи</Label>
            <Textarea
              id="task-desc"
              rows={3}
              placeholder="Подробности, контекст, ссылки..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Исполнитель (Воркер)</Label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-[#E3E3E3] text-xs font-medium focus:outline-none focus:border-[#BB86FC] transition-all"
              >
                <option value="">Не назначен</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} {m.userId === user?.id ? "(Вы)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Приоритет</Label>
              <select
                id="task-priority"
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
              <Label htmlFor="task-status">Статус</Label>
              <select
                id="task-status"
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
              <Label htmlFor="task-due">Срок (Дедлайн)</Label>
              <Input
                id="task-due"
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loader}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={loader || !title.trim()}>
              {loader ? "Создание..." : "Создать задачу"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateTask() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="rounded-2xl font-black"
      >
        <Plus size={15} strokeWidth={2.5} />
        <span>Новая задача</span>
      </Button>

      <CreateTaskModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
