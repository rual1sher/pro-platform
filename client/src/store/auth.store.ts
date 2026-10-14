import { create } from "zustand";
import type { IUser, IOrganization } from "../types";
import { removeToken } from "../components/helper/tokens";

interface IAuthStore {
  user: IUser | null;
  organizations: IOrganization[];
  activeOrg: IOrganization | null;
  authChecked: boolean;
  setUser: (u: IUser | null) => void;
  setOrganizations: (orgs: IOrganization[]) => void;
  setActiveOrg: (org: IOrganization | null) => void;
  setActiveOrgById: (orgId: number) => void;
  setAuthChecked: (checked: boolean) => void;
  logout: () => void;
}

export const useAuth = create<IAuthStore>((set, get) => ({
  user: null,
  organizations: [],
  activeOrg: null,
  authChecked: false,
  setUser: (u) => {
    set({ user: u });
    if (u?.organizations && u.organizations.length > 0) {
      set({ organizations: u.organizations });
      const currentActive = get().activeOrg;
      if (!currentActive || !u.organizations.some((o) => o.id === currentActive.id)) {
        set({ activeOrg: u.organizations[0] });
      }
    }
  },
  setOrganizations: (orgs) => {
    set({ organizations: orgs });
    const currentActive = get().activeOrg;
    if (orgs.length > 0 && (!currentActive || !orgs.some((o) => o.id === currentActive.id))) {
      set({ activeOrg: orgs[0] });
    }
  },
  setActiveOrg: (org) => set({ activeOrg: org }),
  setAuthChecked: (authChecked) => set({ authChecked }),
  setActiveOrgById: (orgId) => {
    const org = get().organizations.find((o) => o.id === orgId);
    if (org) {
      set({ activeOrg: org });
    }
  },
  logout: () => {
    removeToken();
    set({ user: null, organizations: [], activeOrg: null });
  },
}));
