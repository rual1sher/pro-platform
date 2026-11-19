import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth.store";
import { useTask } from "../../store/task.store";
import {
  createOrganization,
  getOrganizations,
  getOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember,
  getAllUsers,
} from "../../service/organization.service";
import { Building2, Users, UserPlus, Trash2, Shield, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { ConfirmModal } from "../helper/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import type { IUser, IOrganizationMember } from "../../types";

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrgModal({ isOpen, onClose }: CreateOrgModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { setOrganizations, setActiveOrg } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const newOrg = await createOrganization({ name, description });
    if (newOrg) {
      const allOrgs = await getOrganizations();
      setOrganizations(allOrgs);
      setActiveOrg(newOrg);
      setName("");
      setDescription("");
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#BB86FC] text-[#121212] flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <DialogTitle>Новая организация</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Название организации *</Label>
            <Input
              id="org-name"
              type="text"
              required
              placeholder="Например, IT Solutions, Отдел разработки..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-desc">Описание (опционально)</Label>
            <Textarea
              id="org-desc"
              rows={3}
              placeholder="Краткое описание деятельности или задач команды"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !name.trim()}>
              {loading ? "Создание..." : "Создать организацию"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MembersModal({ isOpen, onClose }: MembersModalProps) {
  const { activeOrg, user } = useAuth();
  const { members, setMembers } = useTask();
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<IOrganizationMember | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (isOpen && activeOrg) {
      loadMembers();
      loadAllUsers();
    }
  }, [isOpen, activeOrg]);

  const loadMembers = async () => {
    if (!activeOrg) return;
    setLoading(true);
    const data = await getOrganizationMembers(activeOrg.id);
    setMembers(data);
    setLoading(false);
  };

  const loadAllUsers = async () => {
    const users = await getAllUsers();
    setAllUsers(users);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    const payload: { userId?: number; email?: string; role: string } = {
      role: roleInput,
    };

    if (selectedUserId) {
      payload.userId = Number(selectedUserId);
    } else if (emailInput.trim()) {
      payload.email = emailInput.trim();
    } else {
      setAdding(false);
      return;
    }

    const res = await addOrganizationMember(activeOrg!.id, payload);
    if (res) {
      setSelectedUserId("");
      setEmailInput("");
      await loadMembers();
    }
    setAdding(false);
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    const ok = await removeOrganizationMember(activeOrg!.id, removeTarget.userId);
    if (ok) {
      await loadMembers();
    }
    setRemoving(false);
    setRemoveTarget(null);
  };

  const availableUsers = allUsers.filter((u) => !members.some((m) => m.userId === u.id));

  return (
    <>
      <Dialog open={isOpen && !!activeOrg} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#2C2C2C] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#BB86FC] text-[#121212] flex items-center justify-center shadow-sm">
                <Users size={18} />
              </div>
              <div>
                <DialogTitle>Команда и воркеры</DialogTitle>
                <p className="text-xs text-[#03DAC6] font-semibold mt-0.5">
                  Организация: {activeOrg?.name}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Add member form */}
          <div className="px-6 pt-4 flex-shrink-0">
            <form
              onSubmit={handleAddMember}
              className="bg-[#252525] border border-[#2C2C2C] rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#BB86FC]">
                <UserPlus size={14} />
                <span>Добавить воркера в команду</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="normal-case tracking-normal text-[11px] text-[#9E9E9E]">
                    Выбрать пользователя
                  </Label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value ? Number(e.target.value) : "");
                      if (e.target.value) setEmailInput("");
                    }}
                    className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl text-xs text-[#E3E3E3] focus:outline-none focus:border-[#BB86FC] transition-all"
                  >
                    <option value="">-- Выбрать из базы --</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="normal-case tracking-normal text-[11px] text-[#9E9E9E]">
                    Или ввести Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="worker@company.com"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (e.target.value) setSelectedUserId("");
                    }}
                    className="bg-[#1E1E1E] text-xs py-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Label className="normal-case tracking-normal">Роль:</Label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="px-2.5 py-1 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl text-xs text-[#E3E3E3] font-semibold focus:outline-none focus:border-[#BB86FC] transition-all"
                  >
                    <option value="MEMBER">Участник / Воркер</option>
                    <option value="ADMIN">Администратор</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={adding || (!selectedUserId && !emailInput.trim())}
                >
                  {adding ? "Добавление..." : "Добавить в команду"}
                </Button>
              </div>
            </form>
          </div>

          {/* Member list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 min-h-0">
            <div className="text-xs font-extrabold text-[#E3E3E3] uppercase tracking-wider mb-2">
              Сотрудники ({members.length})
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-[#9E9E9E]">
                Загрузка списка...
              </div>
            ) : members.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#9E9E9E]">
                В организации пока нет участников
              </div>
            ) : (
              members.map((m: IOrganizationMember) => {
                const isCurrentUser = m.userId === user?.id;
                const isOwner = m.role === "OWNER";
                const isAdmin = m.role === "ADMIN";

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#252525] border border-[#2C2C2C] shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 ring-2 ring-[#BB86FC]">
                        <AvatarImage src={m.avatar ?? undefined} alt={m.name} />
                        <AvatarFallback className="ring-2 ring-[#03DAC6]">
                          {m.name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#E3E3E3]">
                            {m.name}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="default" className="text-[10px] px-2 py-0.5">
                              Вы
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#9E9E9E]">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isOwner ? "default" : isAdmin ? "accent" : "secondary"}
                        className="text-xs"
                      >
                        {isOwner ? <Shield size={12} /> : <User size={12} />}
                        {isOwner ? "Владелец" : isAdmin ? "Админ" : "Воркер"}
                      </Badge>

                      {!isOwner && !isCurrentUser && (
                        <button
                          onClick={() => setRemoveTarget(m)}
                          title="Удалить из организации"
                          className="p-1.5 text-[#CF6679] hover:bg-[#CF6679]/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 pb-4 flex justify-end border-t border-[#2C2C2C] pt-3 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={!!removeTarget}
        title="Удалить сотрудника из организации?"
        message={
          removeTarget
            ? `${removeTarget.name} потеряет доступ к задачам и чату этой организации.`
            : undefined
        }
        confirmLabel="Удалить"
        variant="danger"
        loading={removing}
        onConfirm={handleConfirmRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </>
  );
}
