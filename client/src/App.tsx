import { useState } from "react";
import { Route, Routes, useLocation } from "react-router";
import { Header } from "./components/header";
import { useBootstrapAuth } from "./components/helper/use-bootstrap-auth";
import { NotFound } from "./components/not-found/not-found";
import { AppSidebar } from "./components/sidebar";
import { LoginPage } from "./page/auth/login";
import { RegisterPage } from "./page/auth/register";
import { ChatPage } from "./page/chat";
import { DashboardPage } from "./page/dashboard";
import { HomePage } from "./page/home/index";
import { OrganizationPage } from "./page/organization";
import { ProfilePage } from "./page/profile";
import { TasksPage } from "./page/tasks";
import { TaskDetailPage } from "./page/tasks/detail";
import { useAuth } from "./store/auth.store";

function App() {
  useBootstrapAuth();
  const { user } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("pro_sidebar_collapsed") === "true";
  });

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("pro_sidebar_collapsed", String(next));
      return next;
    });
  };

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/";
  const showSidebar = Boolean(user && !isAuthPage);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      {showSidebar && (
        <AppSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
      )}

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Routes>
            {/* landing */}
            <Route path="/" element={<HomePage />} />

            {/* auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* app */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/organizations/:id" element={<OrganizationPage />} />

            {/* NotFound */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
