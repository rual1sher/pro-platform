import {
  Building2,
  Calendar,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../store/auth.store";
import { CreateOrgModal } from "../organization/org-modal";
import { Button } from "../ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeOrg, organizations, setActiveOrgById } = useAuth();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target as Node)
      ) {
        setOrgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const navItems = [
    {
      title: "Дашборд",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Задачи",
      path: "/tasks",
      icon: Calendar,
    },
    {
      title: "Чат команды",
      path: "/chat",
      icon: MessageCircle,
    },
    {
      title: "Профиль",
      path: "/profile",
      icon: User,
    },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen z-40 bg-[var(--bg-surface)] border-r border-[var(--border-light)] flex flex-col justify-between transition-all duration-300 shrink-0 ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Верхняя часть: Лого / Заголовок и кнопка скрытия/раскрытия */}
      <div>
        <div className="flex items-center justify-between px-3.5 border-b border-[var(--border-light)] h-16 shrink-0">
          {!isCollapsed && (
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden group"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <CheckSquare size={19} strokeWidth={2} />
              </div>
              <div className="truncate">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight leading-none">
                  PRO Platform
                </h2>
                <span className="text-[10px] font-medium text-[var(--brand-secondary)] tracking-wider uppercase">
                  Workspace
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div
              onClick={() => navigate("/dashboard")}
              className="mx-auto cursor-pointer group"
              title="PRO Platform"
            >
              <div className="w-9 h-9 rounded-2xl bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <CheckSquare size={20} strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* Кнопка скрытия / раскрытия */}
          {!isCollapsed && (
            <Button
              variant="dark"
              size="sm"
              onClick={onToggle}
              title="Скрыть меню"
              className="w-8 h-8 rounded-xl shrink-0 p-0 flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Навигационное меню */}
        <div className="p-2 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/tasks" && location.pathname.startsWith("/tasks/"));

            if (isCollapsed) {
              return (
                <div key={item.path} className="flex justify-center my-1">
                  <Button
                    variant={isActive ? "primary" : "ghost"}
                    onClick={() => navigate(item.path)}
                    title={item.title}
                    className={`w-10 h-10 p-0 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "shadow-sm scale-102"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </Button>
                </div>
              );
            }

            return (
              <Button
                key={item.path}
                variant={isActive ? "primary" : "ghost"}
                onClick={() => navigate(item.path)}
                className={`w-full justify-start gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left h-auto ${
                  isActive
                    ? "font-semibold shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-[var(--bg-main)]/15 text-[var(--bg-main)]"
                      : "bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.75} />
                </div>
                <span className="truncate">{item.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Нижняя часть: информация об организации / выбор организации / кнопка раскрытия */}
      <div className="p-2 border-t border-[var(--border-light)] space-y-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-1" ref={orgDropdownRef}>
            {activeOrg && (
              <div className="relative">
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => setOrgDropdownOpen((prev) => !prev)}
                  title={`Организация: ${activeOrg.name}`}
                  className="w-10 h-10 p-0 rounded-xl flex items-center justify-center text-[var(--brand-secondary)] hover:border-[var(--brand-primary)]"
                >
                  <Building2 size={16} />
                </Button>

                {orgDropdownOpen && (
                  <div className="absolute left-full bottom-0 ml-2 w-64 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 text-[var(--text-primary)]">
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-light)] mb-1">
                      Мои организации
                    </div>
                    <div className="max-h-52 overflow-y-auto overflow-x-hidden space-y-0.5">
                      {organizations.map((org) => {
                        const isSelected = org.id === activeOrg.id;
                        return (
                          <div
                            key={org.id}
                            onClick={() => {
                              setActiveOrgById(org.id);
                              setOrgDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer select-none ${
                              isSelected
                                ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-semibold"
                                : "text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                              <Building2
                                size={14}
                                className="text-[var(--brand-secondary)] shrink-0"
                              />
                              <span className="truncate">{org.name}</span>
                            </div>
                            {isSelected && (
                              <Check
                                size={14}
                                className="text-[var(--brand-primary)] shrink-0"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-[var(--border-light)] mt-1 pt-1 space-y-0.5">
                      <div
                        onClick={() => {
                          navigate(`/organizations/${activeOrg.id}`);
                          setOrgDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] cursor-pointer transition-colors"
                      >
                        <Settings size={13} />
                        <span>Управление организацией</span>
                      </div>
                      <div
                        onClick={() => {
                          setOrgDropdownOpen(false);
                          setCreateOrgOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 cursor-pointer transition-colors"
                      >
                        <Plus size={13} />
                        <span>Новая организация</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="dark"
              size="sm"
              onClick={onToggle}
              title="Раскрыть меню"
              className="w-10 h-10 p-0 rounded-full"
            >
              <ChevronRight size={17} />
            </Button>
          </div>
        ) : (
          <div className="relative" ref={orgDropdownRef}>
            {activeOrg ? (
              <div
                onClick={() => setOrgDropdownOpen((prev) => !prev)}
                className={`p-2.5 bg-[var(--bg-overlay)] border rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 overflow-hidden select-none ${
                  orgDropdownOpen
                    ? "border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/30"
                    : "border-[var(--border-light)] hover:border-[var(--brand-primary)]/50"
                }`}
                title="Выбрать организацию"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)] flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div className="min-w-0 flex-1 leading-tight text-left">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {activeOrg.name}
                    </p>
                    <span className="text-[10px] text-[var(--brand-secondary)] font-medium">
                      Организация
                    </span>
                  </div>
                </div>
                <ChevronsUpDown
                  size={14}
                  className="text-[var(--text-secondary)] shrink-0"
                />
              </div>
            ) : (
              <Button
                variant="dark"
                size="sm"
                onClick={() => setCreateOrgOpen(true)}
                className="w-full justify-center gap-2 text-xs rounded-xl"
              >
                <Plus size={14} />
                <span>Создать организацию</span>
              </Button>
            )}

            {/* Всплывающее вверх меню выбора организации (Select Popover) */}
            {orgDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150 text-[var(--text-primary)]">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-light)] mb-1">
                  Мои организации
                </div>

                <div className="max-h-52 overflow-y-auto overflow-x-hidden space-y-0.5">
                  {organizations.map((org) => {
                    const isSelected = org.id === activeOrg?.id;
                    return (
                      <div
                        key={org.id}
                        onClick={() => {
                          setActiveOrgById(org.id);
                          setOrgDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer select-none ${
                          isSelected
                            ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-semibold"
                            : "text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                          <Building2
                            size={14}
                            className="text-[var(--brand-secondary)] shrink-0"
                          />
                          <span className="truncate">{org.name}</span>
                        </div>
                        {isSelected && (
                          <Check
                            size={14}
                            className="text-[var(--brand-primary)] shrink-0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[var(--border-light)] mt-1 pt-1 space-y-0.5">
                  {activeOrg && (
                    <div
                      onClick={() => {
                        navigate(`/organizations/${activeOrg.id}`);
                        setOrgDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] cursor-pointer transition-colors"
                    >
                      <Settings size={13} />
                      <span>Управление организацией</span>
                    </div>
                  )}
                  <div
                    onClick={() => {
                      setOrgDropdownOpen(false);
                      setCreateOrgOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 cursor-pointer transition-colors"
                  >
                    <Plus size={13} />
                    <span>Новая организация</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateOrgModal isOpen={createOrgOpen} onClose={() => setCreateOrgOpen(false)} />
    </aside>
  );
}
