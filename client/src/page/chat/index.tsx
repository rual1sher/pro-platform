import { AuthLoading } from "../../components/helper/auth-loading";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { OrgChat } from "../../components/organization/chat";

export function ChatPage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="w-full p-3 sm:p-4 text-[var(--text-primary)]">
      <OrgChat />
    </div>
  );
}
