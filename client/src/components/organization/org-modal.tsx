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
import { X, Building2, Users, UserPlus, Trash2, Shield, User } from "lucide-react";
import { Button } from "../helper/button";
import { ConfirmModal } from "../helper/confirm-modal";
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[32px] w-full max-w-md p-6 shadow-2xl space-y-5 text-[#E3E3E3]">
        <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#BB86FC] text-[#121212] flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <h2 className="text-lg font-extrabold text-[#E3E3E3]">Новая организация</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9E9E9E] hover:text-[#E3E3E3] rounded-full hover:bg-[#252525] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#E3E3E3] mb-1.5 uppercase tracking-wider">
              Название организации *
            </label>
            <input
              type="text"
              required
              placeholder="Например, IT Solutions, Отдел разработки..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-2xl text-[#E3E3E3] placeholder-[#616161] focus:outline-none focus:border-[#BB86FC] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E3E3E3] mb-1.5 uppercase tracking-wider">
              Описание (опционально)
            </label>
            <textarea
              rows={3}
              placeholder="Краткое описание деятельности или задач команды"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-2xl text-[#E3E3E3] placeholder-[#616161] focus:outline-none focus:border-[#BB86FC] transition-colors text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !name.trim()}>
              {loading ? "Создание..." : "Создать организацию"}
            </Button>
          </div>
        </form>
      </div>
    </div>
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

  if (!isOpen || !activeOrg) return null;

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

    const res = await addOrganizationMember(activeOrg.id, payload);
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
    const ok = await removeOrganizationMember(activeOrg.id, removeTarget.userId);
    if (ok) {
      await loadMembers();
    }
    setRemoving(false);
    setRemoveTarget(null);
  };

  const availableUsers = allUsers.filter(
    (u) => !members.some((m) => m.userId === u.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[32px] w-full max-w-xl max-h-[90vh] flex flex-col p-6 shadow-2xl space-y-5 text-[#E3E3E3]">
        <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#BB86FC] text-[#121212] flex items-center justify-center shadow-sm">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#E3E3E3]">Команда и воркеры</h2>
              <p className="text-xs text-[#03DAC6] font-semibold">
                Организация: {activeOrg.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9E9E9E] hover:text-[#E3E3E3] rounded-full hover:bg-[#252525] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add member form */}
        <form onSubmit={handleAddMember} className="bg-[#252525] border border-[#2C2C2C] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#BB86FC]">
            <UserPlus size={14} />
            <span>Добавить воркера в команду</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#9E9E9E] mb-1">Выбрать пользователя</label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value ? Number(e.target.value) : "");
                  if (e.target.value) setEmailInput("");
                }}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl text-xs text-[#E3E3E3] focus:outline-none focus:border-[#BB86FC]"
              >
                <option value="">-- Выбрать из базы --</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#9E9E9E] mb-1">Или ввести Email</label>
              <input
                type="email"
                placeholder="worker@company.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (e.target.value) setSelectedUserId("");
                }}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl text-xs text-[#E3E3E3] placeholder-[#616161] focus:outline-none focus:border-[#BB86FC]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#E3E3E3]">Роль:</label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="px-2.5 py-1 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl text-xs text-[#E3E3E3] font-semibold focus:outline-none focus:border-[#BB86FC]"
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

        {/* Member list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[280px]">
          <div className="text-xs font-extrabold text-[#E3E3E3] uppercase tracking-wider mb-2">
            Сотрудники ({members.length})
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-[#9E9E9E]">Загрузка списка...</div>
          ) : members.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#9E9E9E]">В организации пока нет участников</div>
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
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#BB86FC]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#BB86FC] text-[#121212] flex items-center justify-center font-bold text-xs ring-2 ring-[#03DAC6]">
                        {m.name.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#E3E3E3]">
                          {m.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BB86FC] text-[#121212] font-black">
                            Вы
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9E9E9E]">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                        isOwner
                          ? "bg-[#BB86FC]/20 text-[#BB86FC] border border-[#BB86FC]/40"
                          : isAdmin
                          ? "bg-[#03DAC6]/20 text-[#03DAC6] border border-[#03DAC6]/40"
                          : "bg-[#1E1E1E] text-[#E3E3E3] border border-[#2C2C2C]"
                      }`}
                    >
                      {isOwner && <Shield size={12} />}
                      {!isOwner && <User size={12} />}
                      {isOwner ? "Владелец" : isAdmin ? "Админ" : "Воркер"}
                    </span>

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

        <div className="pt-2 flex justify-end border-t border-[#2C2C2C]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>

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
    </div>
  );
}
