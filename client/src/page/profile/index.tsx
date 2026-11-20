import { Container } from "../../components/helper/container";
import { ProfileComponent } from "../../components/profile";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { AuthLoading } from "../../components/helper/auth-loading";

export function ProfilePage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="w-full text-[var(--text-primary)] pb-12 pt-4">
      <Container className="py-2">
        <ProfileComponent />
      </Container>
    </div>
  );
}
