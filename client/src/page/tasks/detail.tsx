import { AlertCircle, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AuthLoading } from "../../components/helper/auth-loading";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { TaskDetailComponent } from "../../components/tasks/detail-page";
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
    <div className="w-full text-[var(--text-primary)] pb-12 pt-3">
      {notFound ? (
        <div className="text-center py-20 space-y-4 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[var(--status-error)]/15 text-[var(--status-error)] flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Задача #{id} не найдена
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Возможно, задача была удалена или у вас нет доступа к этой организации.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/tasks")}
            className="gap-2 text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] mx-auto"
          >
            <ArrowLeft size={14} />
            <span>Вернуться к доске задач</span>
          </Button>
        </div>
      ) : !task ? (
        <div className="flex flex-col items-center justify-center py-28 space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-xs font-medium">
            Загрузка задачи...
          </p>
        </div>
      ) : (
        <TaskDetailComponent task={task} onBack={() => navigate("/tasks")} />
      )}
    </div>
  );
}
