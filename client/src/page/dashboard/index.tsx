import { DashboardComponent } from "../../components/dashboard";
import { AuthLoading } from "../../components/helper/auth-loading";
import { useAuthGuard } from "../../components/helper/use-auth-guard";

export function DashboardPage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="w-full text-[var(--text-primary)] pb-12 pt-3">
      <DashboardComponent />
    </div>
  );
}
