import { OrgChat } from "../../components/organization/chat";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { AuthLoading } from "../../components/helper/auth-loading";

export function ChatPage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="w-full text-[var(--text-primary)] px-4 py-3">
      <OrgChat />
    </div>
  );
}
