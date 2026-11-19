import { RegisterComponent } from "../../components/auth/register";
import { Container } from "../../components/helper/container";

export function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-[#E3E3E3] py-10">
      <Container>
        <RegisterComponent />
      </Container>
    </div>
  );
}
