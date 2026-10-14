import { Container } from "../../components/helper/container";
import { DashboardComponent } from "../../components/dashboard";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { AuthLoading } from "../../components/helper/auth-loading";

export function DashboardPage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E3E3E3] pb-12 pt-4">
      <Container className="py-2">
        <DashboardComponent />
      </Container>
    </div>
  );
}
