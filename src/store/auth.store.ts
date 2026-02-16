import { create } from "zustand";
import type { IUser } from "../types/type";

interface IAuthStore {
  user: IUser | null;
  setUser: (u: IUser) => void;
}

export const useAuth = create<IAuthStore>((set) => ({
  user: null,
  setUser: (u) => set(() => ({ user: u })),
}));
