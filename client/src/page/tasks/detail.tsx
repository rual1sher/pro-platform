import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Container } from "../../components/helper/container";
import { TaskDetailComponent } from "../../components/tasks/detail-page";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { AuthLoading } from "../../components/helper/auth-loading";
import { Button } from "../../components/ui/button";
import { getById } from "../../service/task.service";
import { useTask } from "../../store/task.store";

export function TaskDetailPage() {
  const { checking } = useAuthGuard();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);

  const { tasks, addTask } = useTask();
  const task = tasks.find((t) => t.id === taskId);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    if (task || Number.isNaN(taskId)) return;

    let cancelled = false;

    getById(taskId).then((fetched) => {
      if (cancelled) return;
      if (fetched) {
        addTask(fetched);
      } else {
        setFetchFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [taskId, task, addTask]);

  if (checking) {
    return <AuthLoading />;
  }

  const notFound = fetchFailed || Number.isNaN(taskId);

  return (
    <div className="w-full text-[#E3E3E3] pb-12 pt-4">
      <Container className="py-2">
        {notFound ? (
          <div className="max-w-md mx-auto text-center py-20 space-y-3">
            <p className="text-sm font-bold text-[#E3E3E3]">Задача не найдена</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/tasks")}
              className="text-xs font-bold text-[#BB86FC] hover:text-[#a871ea]"
            >
              Вернуться к доске задач
            </Button>
          </div>
        ) : !task ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-[#BB86FC] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#E3E3E3] text-xs font-bold">Загрузка задачи...</p>
          </div>
        ) : (
          <TaskDetailComponent task={task} onBack={() => navigate("/tasks")} />
        )}
      </Container>
    </div>
  );
}
