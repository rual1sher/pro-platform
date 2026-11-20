import { Container } from "../../components/helper/container";
import { HeaderComponent } from "../../components/home/main";

export function HomePage() {
  return (
    <div className="w-full text-[var(--text-primary)] pb-16">
      <Container>
        <HeaderComponent />
      </Container>
    </div>
  );
}
