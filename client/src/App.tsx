import { useState } from "react";
import { Route, Routes, useLocation } from "react-router";
import { Header } from "./components/header";
import { AppSidebar } from "./components/sidebar";
import { HomePage } from "./page/home/index";
import { NotFound } from "./components/not-found/not-found";
import { LoginPage } from "./page/auth/login";
import { TasksPage } from "./page/tasks";
import { TaskDetailPage } from "./page/tasks/detail";
import { RegisterPage } from "./page/auth/regisnter";
import { ChatPage } from "./page/chat";
import { DashboardPage } from "./page/dashboard";
import { ProfilePage } from "./page/profile";
import { OrganizationPage } from "./page/organization";
import { useBootstrapAuth } from "./components/helper/use-bootstrap-auth";
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
    <div className="flex min-h-screen bg-[#121212] text-[#E3E3E3]">
      {showSidebar && (
        <AppSidebar
          isCollapsed={isCollapsed}
          onToggle={handleToggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={showSidebar ? handleToggleSidebar : undefined}
          isSidebarCollapsed={isCollapsed}
        />
        <main className="flex-1 min-w-0">
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
