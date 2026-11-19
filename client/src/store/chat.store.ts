import { create } from "zustand";
import type { IMessage } from "../types";

interface IChatStore {
  organizationId: number | null;
  messages: IMessage[];
  setChat: (organizationId: number, messages: IMessage[]) => void;
  addMessage: (message: IMessage) => void;
  removeMessage: (id: number) => void;
}

export const useChat = create<IChatStore>((set) => ({
  organizationId: null,
  messages: [],

  setChat: (organizationId, messages) => set({ organizationId, messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: state.messages.some((m) => m.id === message.id)
        ? state.messages
        : [...state.messages, message],
    })),

  removeMessage: (id) =>
    set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),
}));
