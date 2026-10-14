import { Container } from "../../components/helper/container";
import { HeaderComponent } from "../../components/home/main";

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#121212] text-[#E3E3E3]">
      <Container>
        <HeaderComponent />
      </Container>
    </div>
  );
}
