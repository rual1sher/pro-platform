import { RegisterComponent } from "../../components/auth/register";
import { Animations } from "../../components/helper/animations";
import { Container } from "../../components/helper/container";

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200">
      <Container>
        <RegisterComponent />
      </Container>

      <Animations />
    </div>
  );
}
