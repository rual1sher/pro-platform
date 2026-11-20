import { DashboardComponent } from "../../components/dashboard";
import { AuthLoading } from "../../components/helper/auth-loading";
import { Container } from "../../components/helper/container";
import { useAuthGuard } from "../../components/helper/use-auth-guard";

export function DashboardPage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <Container className="p-4 sm:p-6">
      <DashboardComponent />
    </Container>
  );
}
