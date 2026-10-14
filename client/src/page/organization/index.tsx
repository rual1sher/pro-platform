import { useParams } from "react-router";
import { Container } from "../../components/helper/container";
import { OrgProfileComponent } from "../../components/organization/profile";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { AuthLoading } from "../../components/helper/auth-loading";

export function OrganizationPage() {
  const { checking } = useAuthGuard();
  const { id } = useParams<{ id: string }>();
  const organizationId = Number(id);

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E3E3E3] pb-12 pt-4">
      <Container className="py-2">
        {Number.isNaN(organizationId) ? (
          <div className="py-16 text-center text-[#9E9E9E] text-sm font-bold">
            Некорректный идентификатор организации.
          </div>
        ) : (
          <OrgProfileComponent organizationId={organizationId} />
        )}
      </Container>
    </div>
  );
}
