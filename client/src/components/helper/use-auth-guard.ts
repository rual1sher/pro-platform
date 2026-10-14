import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../store/auth.store";

// Relies on the app-wide session restore (see use-bootstrap-auth.ts) and only
// redirects once that check has actually run — avoids re-fetching /auth/me
// on every protected page and avoids a false redirect while it's in flight.
export function useAuthGuard() {
  const navigate = useNavigate();
  const { user, authChecked } = useAuth();

  useEffect(() => {
    if (authChecked && !user) {
      navigate("/login");
    }
  }, [authChecked, user]);

  return { checking: !authChecked };
}
