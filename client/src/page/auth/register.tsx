import { RegisterComponent } from "../../components/auth/register";
import { Container } from "../../components/helper/container";

export function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-[var(--text-primary)] py-10">
      <Container>
        <RegisterComponent />
      </Container>
    </div>
  );
}
