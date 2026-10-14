import { useEffect } from "react";
import { me } from "../../service/auth.service";
import { getOrganizations } from "../../service/organization.service";
import { useAuth } from "../../store/auth.store";

// Restores the session from the stored token once, app-wide — so a page reload
// keeps you logged in on every route, including the public landing page, not
// only on routes that happen to run a protected-route check.
export function useBootstrapAuth() {
  const { authChecked, setUser, setOrganizations, setAuthChecked } = useAuth();

  useEffect(() => {
    if (authChecked) return;

    const bootstrap = async () => {
      const userData = await me();
      if (userData) {
        setUser(userData);
        const orgs = await getOrganizations();
        setOrganizations(orgs);
      }
      setAuthChecked(true);
    };

    bootstrap();
  }, [authChecked]);
}
