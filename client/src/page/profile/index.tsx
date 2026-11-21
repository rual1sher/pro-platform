import { AuthLoading } from "../../components/helper/auth-loading";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { ProfileComponent } from "../../components/profile";

export function ProfilePage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="w-full text-[var(--text-primary)] pb-12 pt-3">
      <ProfileComponent />
    </div>
  );
}
