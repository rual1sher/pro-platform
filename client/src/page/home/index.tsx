import { Container } from "../../components/helper/container";
import { HeaderComponent } from "../../components/home/main";

export function HomePage() {
  return (
    <div className="w-full text-[#E3E3E3] pb-16">
      <Container>
        <HeaderComponent />
      </Container>
    </div>
  );
}
