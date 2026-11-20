import {
  Building2,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MessageCircle,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../store/auth.store";
import { Button } from "../ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeOrg } = useAuth();

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

      {/* Нижняя часть: информация об организации / кнопка раскрытия в свернутом виде */}
      <div className="p-2 border-t border-[var(--border-light)] space-y-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
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
          activeOrg && (
            <div
              onClick={() => navigate(`/organizations/${activeOrg.id}`)}
              className="p-2.5 bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-2xl cursor-pointer hover:border-[var(--brand-primary)]/50 transition-colors flex items-center gap-2.5 overflow-hidden"
              title="Перейти в организацию"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)] flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {activeOrg.name}
                </p>
                <span className="text-[10px] text-[var(--brand-secondary)] font-semibold">
                  Организация
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </aside>
  );
}
