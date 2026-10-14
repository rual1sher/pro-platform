import { RegisterComponent } from "../../components/auth/register";
import { Container } from "../../components/helper/container";

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#E3E3E3] py-16">
      <Container>
        <RegisterComponent />
      </Container>
    </div>
  );
}
