import { useEffect } from "react";
import { Container } from "../../components/helper/container";
import { TasksComponent } from "../../components/tasks";
import { me } from "../../service/auth.service";
import { useNavigate } from "react-router";
import { useAuth } from "../../store/auth.store";
import { CreateTask } from "../../components/tasks/functions/create";

export function TasksPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const checkUser = async () => {
      const res = await me();

      if (!res) {
        navigate("/login");
      } else {
        setUser(res);
      }
    };

    checkUser();
  }, []);

  return (
    <div className="min-h-lvh pt-25 bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200">
      <Container className="py-0!">
        <CreateTask />
        <TasksComponent />
      </Container>
    </div>
  );
}
