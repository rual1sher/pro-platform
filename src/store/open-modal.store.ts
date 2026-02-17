import { create } from "zustand";

interface IStore {
  isOpen: number | null;
  onOpen: (id: number | null) => void;
  onClose: () => void;
}

export const useOpenRemoveModal = create<IStore>((set) => ({
  isOpen: null,
  onOpen: (id) =>
    set((e) => ({
      isOpen: e.isOpen === id ? null : id,
    })),
  onClose: () => set({ isOpen: null }),
}));

export const useOpenEditModal = create<IStore>((set) => ({
  isOpen: null,
  onOpen: (id) =>
    set((e) => ({
      isOpen: e.isOpen === id ? null : id,
    })),
  onClose: () => set({ isOpen: null }),
}));
