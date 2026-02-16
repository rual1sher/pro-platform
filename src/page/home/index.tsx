import { Animations } from "../../components/helper/animations";
import { Container } from "../../components/helper/container";
import { HeaderComponent } from "../../components/home/main";

export function HomePage() {
  return (
    <div className="min-h-lvh flex items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200">
      <Container>
        <HeaderComponent />
      </Container>

      <Animations />
    </div>
  );
}
