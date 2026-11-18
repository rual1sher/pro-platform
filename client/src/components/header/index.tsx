import {
  CheckSquare,
  Home,
  Bell,
  PanelLeft,
} from "lucide-react";
import { Container } from "../helper/container";
import { useNavigate } from "react-router";
import { useAuth } from "../../store/auth.store";
import { Logout } from "./functions/logout";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Header({ onToggleSidebar, isSidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const { user, activeOrg } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#1E1E1E]/95 backdrop-blur-md border-b border-[#2C2C2C] py-2.5">
      <Container>
        <div className="flex items-center justify-between gap-4">
          {/* 1. Left: Toggle Sidebar Button & Brand Logo */}
          <div className="flex items-center gap-3">
            {user && onToggleSidebar && (
              <Button
                variant="dark"
                size="sm"
                onClick={onToggleSidebar}
                title={isSidebarCollapsed ? "Раскрыть меню" : "Скрыть меню"}
                className="w-9 h-9 p-0 rounded-xl"
              >
                <PanelLeft size={17} />
              </Button>
            )}

            <div
              onClick={() => navigate(user ? "/dashboard" : "/")}
              className="cursor-pointer flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#BB86FC] text-[#121212] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <CheckSquare size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-base font-black text-[#E3E3E3] tracking-tight leading-none">
                  PRO Platform
                </h1>
                <span className="text-[10px] font-bold text-[#03DAC6] tracking-wider uppercase">
                  Task Manager v1
                </span>
              </div>
            </div>
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
                  className="w-8 h-8 rounded-full p-0"
                >
                  <Home size={15} />
                </Button>

                {/* Notification Bell */}
                <Button
                  variant="dark"
                  size="sm"
                  title="Уведомления"
                  className="w-8 h-8 rounded-full p-0 text-[#9E9E9E] hover:text-[#E3E3E3]"
                >
                  <Bell size={15} />
                </Button>

                {/* User Profile Chip */}
                <div className="flex items-center gap-2 pl-2 border-l border-[#2C2C2C]">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/profile")}
                    title="Профиль"
                    className="p-1 rounded-xl h-auto flex items-center gap-2"
                  >
                    <Avatar className="w-8 h-8 ring-2 ring-[#BB86FC]">
                      <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                      <AvatarFallback className="ring-2 ring-[#03DAC6] text-xs">
                        {user.name ? user.name.substring(0, 1).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="hidden sm:block text-left leading-tight">
                      <p className="font-bold text-xs text-[#E3E3E3] truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-[#9E9E9E] font-semibold truncate max-w-[120px]">
                        {activeOrg?.name || "Воркер"}
                      </p>
                    </div>
                  </Button>

                  <Logout />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Войти
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Регистрация
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
