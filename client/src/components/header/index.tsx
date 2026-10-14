import {
  CheckSquare,
  Home,
  LayoutDashboard,
  Calendar,
  MessageCircle,
  Bell,
} from "lucide-react";
import { Container } from "../helper/container";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../store/auth.store";
import { Logout } from "./functions/logout";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeOrg } = useAuth();

  const isDashboardActive = location.pathname === "/dashboard";
  const isTasksActive = location.pathname === "/tasks";
  const isChatActive = location.pathname === "/chat";

  return (
    <header className="sticky top-0 z-30 bg-[#1E1E1E]/95 backdrop-blur-md border-b border-[#2C2C2C] py-2.5">
      <Container>
        <div className="flex items-center justify-between gap-4">
          {/* 1. Left: Brand Logo */}
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

          {/* 2. Center: Rounded Floating Pill Navigation (authenticated only) */}
          {user && (
            <nav className="hidden md:flex items-center bg-[#252525] text-[#E3E3E3] p-1.5 rounded-full shadow-md border border-[#2C2C2C] gap-1">
              <button
                onClick={() => navigate("/dashboard")}
                title="Дашборд"
                className={`p-2 rounded-full transition-all ${
                  isDashboardActive
                    ? "bg-[#BB86FC] text-[#121212] shadow-sm scale-105 font-bold"
                    : "text-[#9E9E9E] hover:text-[#E3E3E3] hover:bg-[#1E1E1E]"
                }`}
              >
                <LayoutDashboard size={17} />
              </button>

              <button
                onClick={() => navigate("/tasks")}
                title="Доска задач"
                className={`p-2 rounded-full transition-all ${
                  isTasksActive
                    ? "bg-[#BB86FC] text-[#121212] shadow-sm scale-105 font-bold"
                    : "text-[#9E9E9E] hover:text-[#E3E3E3] hover:bg-[#1E1E1E]"
                }`}
              >
                <Calendar size={17} />
              </button>

              <button
                onClick={() => navigate("/chat")}
                title="Чат команды"
                className={`p-2 rounded-full transition-all ${
                  isChatActive
                    ? "bg-[#BB86FC] text-[#121212] shadow-sm scale-105 font-bold"
                    : "text-[#9E9E9E] hover:text-[#E3E3E3] hover:bg-[#1E1E1E]"
                }`}
              >
                <MessageCircle size={17} />
              </button>
            </nav>
          )}

          {/* 3. Right: Notifications & User Profile Chip */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <>
                {/* Back to public landing */}
                <button
                  onClick={() => navigate("/")}
                  title="На главную"
                  className="w-8 h-8 rounded-full bg-[#252525] border border-[#2C2C2C] flex items-center justify-center text-[#9E9E9E] hover:text-[#E3E3E3] hover:border-[#BB86FC] transition-colors"
                >
                  <Home size={15} />
                </button>

                {/* Notification Bell */}
                <div className="w-8 h-8 rounded-full bg-[#252525] border border-[#2C2C2C] flex items-center justify-center text-[#9E9E9E] hover:text-[#E3E3E3] cursor-pointer hover:border-[#BB86FC] transition-colors">
                  <Bell size={15} />
                </div>

                {/* User Profile Chip */}
                <div className="flex items-center gap-2 pl-2 border-l border-[#2C2C2C]">
                  <button
                    onClick={() => navigate("/profile")}
                    title="Профиль"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#BB86FC]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#BB86FC] text-[#121212] ring-2 ring-[#03DAC6] flex items-center justify-center text-xs font-bold">
                        {user.name ? user.name.substring(0, 1).toUpperCase() : "U"}
                      </div>
                    )}

                    <div className="hidden sm:block text-left leading-tight">
                      <p className="font-bold text-xs text-[#E3E3E3] truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-[#9E9E9E] font-semibold truncate max-w-[120px]">
                        {activeOrg?.name || "Воркер"}
                      </p>
                    </div>
                  </button>

                  <Logout />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#E3E3E3] hover:bg-[#252525] transition-colors"
                >
                  Войти
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#BB86FC] text-[#121212] hover:bg-[#a871ea] shadow-sm transition-colors"
                >
                  Регистрация
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
