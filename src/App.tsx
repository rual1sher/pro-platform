import { Route, Routes } from "react-router";
import { Header } from "./components/header";
import { HomePage } from "./page/home/index";
import { NotFound } from "./components/not-found/not-found";
import { LoginPage } from "./page/auth/login";
import { TasksPage } from "./page/tasks";
import { RegisterPage } from "./page/auth/regisnter";
import { AboutPage } from "./page/about";

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* home */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* tasks */}
        <Route path="/tasks" element={<TasksPage />} />

        {/* NotFound */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
