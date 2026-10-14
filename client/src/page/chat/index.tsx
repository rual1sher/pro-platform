import { Container } from "../../components/helper/container";
import { OrgChat } from "../../components/organization/chat";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { AuthLoading } from "../../components/helper/auth-loading";

export function ChatPage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E3E3E3] pb-12 pt-4">
      <Container className="py-2">
        <OrgChat />
      </Container>
    </div>
  );
}
