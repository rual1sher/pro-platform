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
    <Container className="p-4 sm:p-6">
      <ProfileComponent />
    </Container>
  );
}
