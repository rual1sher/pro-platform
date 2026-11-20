import { LoginComponent } from "../../components/auth/login";
import { Container } from "../../components/helper/container";

export function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-[var(--text-primary)] py-10">
      <Container>
        <LoginComponent />
      </Container>
    </div>
  );
}
