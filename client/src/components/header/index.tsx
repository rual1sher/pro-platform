import { Bell, CheckSquare, Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../store/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Logout } from "./functions/logout";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeOrg } = useAuth();

  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p.startsWith("/dashboard")) return "Дашборд";
    if (p.startsWith("/tasks/")) return "Детали задачи";
    if (p.startsWith("/tasks")) return "Доска задач";
    if (p.startsWith("/chat")) return "Чат команды";
    if (p.startsWith("/organizations/")) return "Организация";
    if (p.startsWith("/profile")) return "Профиль пользователя";
    return "";
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-light)] h-16 shrink-0 flex items-center px-4 sm:px-6 w-full">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* 1. Left: Dynamic Breadcrumbs when logged in, or Clean Brand Logo when guest */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 text-xs">
              <span
                onClick={() => navigate("/dashboard")}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors font-normal"
              >
                {activeOrg?.name || "Рабочее пространство"}
              </span>
              <span className="text-[var(--text-disabled)] font-light">/</span>
              <span className="text-[var(--text-primary)] font-medium">
                {getBreadcrumb()}
              </span>
            </div>
          ) : (
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center shadow-xs">
                <CheckSquare size={17} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight leading-none">
                  PRO Platform
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* 2. Right: Notifications & User Profile Chip */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <>
              {/* Back to public landing */}
              <Button
                variant="dark"
                size="sm"
                onClick={() => navigate("/")}
                title="На главную"
                className="w-8 h-8 rounded-lg p-0"
              >
                <Home size={15} strokeWidth={1.75} />
              </Button>

              {/* Notification Bell */}
              <Button
                variant="dark"
                size="sm"
                title="Уведомления"
                className="w-8 h-8 rounded-lg p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <Bell size={15} strokeWidth={1.75} />
              </Button>

              {/* User Profile Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-light)]">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  title="Профиль"
                  className="p-1 rounded-lg h-auto flex items-center gap-2"
                >
                  <Avatar className="w-8 h-8 ring-1 ring-[var(--border-light)]">
                    <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-xs bg-[var(--bg-overlay)] text-[var(--text-primary)]">
                      {user.name ? user.name.substring(0, 1).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden sm:block text-left leading-tight">
                    <p className="font-medium text-xs text-[var(--text-primary)] truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-normal truncate max-w-[120px]">
                      {activeOrg?.name || "Воркер"}
                    </p>
                  </div>
                </Button>

                <Logout />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Войти
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
                Регистрация
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
