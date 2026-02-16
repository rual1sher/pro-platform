import { AboutComponent } from "../../components/about";
import { Animations } from "../../components/helper/animations";
import { Container } from "../../components/helper/container";

export function AboutPage() {
  return (
    <div className="min-h-lvh flex bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200">
      <Container>
        <AboutComponent />
      </Container>

      <Animations />
    </div>
  );
}
