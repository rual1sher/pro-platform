import { Route, Routes } from "react-router";
import { Header } from "./components/header";
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

function App() {
  useBootstrapAuth();

  return (
    <>
      <Header />
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
    </>
  );
}

export default App;
