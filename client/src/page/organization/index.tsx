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
    <Container className="p-4 sm:p-6">
      {Number.isNaN(organizationId) ? (
        <div className="py-16 text-center text-[var(--text-secondary)] text-sm font-bold">
          Некорректный идентификатор организации.
        </div>
      ) : (
        <OrgProfileComponent organizationId={organizationId} />
      )}
    </Container>
  );
}
