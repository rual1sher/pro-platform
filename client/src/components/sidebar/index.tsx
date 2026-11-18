import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  CheckSquare,
} from "lucide-react";
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
      className={`sticky top-0 h-screen z-40 bg-[#1E1E1E] border-r border-[#2C2C2C] flex flex-col justify-between transition-all duration-300 shrink-0 ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Верхняя часть: Лого / Заголовок и кнопка скрытия/раскрытия */}
      <div>
        <div className="flex items-center justify-between p-3.5 border-b border-[#2C2C2C] h-[61px]">
          {!isCollapsed && (
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            >
              <div className="w-8 h-8 rounded-xl bg-[#BB86FC] text-[#121212] flex items-center justify-center shrink-0 shadow-sm">
                <CheckSquare size={18} strokeWidth={2.5} />
              </div>
              <div className="truncate">
                <h2 className="text-sm font-black text-[#E3E3E3] leading-none">
                  PRO Platform
                </h2>
                <span className="text-[10px] font-bold text-[#03DAC6] tracking-wider uppercase">
                  Workspace
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div
              onClick={() => navigate("/dashboard")}
              className="mx-auto cursor-pointer"
              title="PRO Platform"
            >
              <div className="w-8 h-8 rounded-xl bg-[#BB86FC] text-[#121212] flex items-center justify-center shadow-sm">
                <CheckSquare size={18} strokeWidth={2.5} />
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
              className="p-1.5 w-8 h-8 rounded-xl shrink-0"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Навигационное меню */}
        <div className="p-2 space-y-1.5 mt-2">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#9E9E9E]">
              Навигация
            </div>
          )}

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
                    className={`w-11 h-11 p-0 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "shadow-md scale-105"
                        : "text-[#9E9E9E] hover:text-[#E3E3E3] hover:bg-[#252525]"
                    }`}
                  >
                    <Icon size={19} />
                  </Button>
                </div>
              );
            }

            return (
              <Button
                key={item.path}
                variant={isActive ? "primary" : "ghost"}
                onClick={() => navigate(item.path)}
                className={`w-full justify-start gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left h-auto ${
                  isActive
                    ? "font-black shadow-sm"
                    : "text-[#9E9E9E] hover:text-[#E3E3E3] hover:bg-[#252525]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-[#121212]/15 text-[#121212]"
                      : "bg-[#252525] text-[#9E9E9E]"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className="truncate">{item.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Нижняя часть: информация об организации / кнопка раскрытия в свернутом виде */}
      <div className="p-2 border-t border-[#2C2C2C] space-y-2">
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
              className="p-2.5 bg-[#252525] border border-[#2C2C2C] rounded-2xl cursor-pointer hover:border-[#BB86FC]/50 transition-colors flex items-center gap-2.5 overflow-hidden"
              title="Перейти в организацию"
            >
              <div className="w-8 h-8 rounded-xl bg-[#03DAC6]/15 text-[#03DAC6] flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-xs font-bold text-[#E3E3E3] truncate">
                  {activeOrg.name}
                </p>
                <span className="text-[10px] text-[#03DAC6] font-semibold">
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
