import { create } from "zustand";
import type { IMessage } from "../types";

interface IMessageStore {
  messagesByTask: Record<number, IMessage[]>;
  setTaskMessages: (taskId: number, messages: IMessage[]) => void;
  addTaskMessage: (taskId: number, message: IMessage) => void;
  removeTaskMessage: (taskId: number, messageId: number) => void;
}

export const useMessages = create<IMessageStore>((set) => ({
  messagesByTask: {},

  setTaskMessages: (taskId, messages) =>
    set((state) => ({ messagesByTask: { ...state.messagesByTask, [taskId]: messages } })),

  addTaskMessage: (taskId, message) =>
    set((state) => ({
      messagesByTask: {
        ...state.messagesByTask,
        [taskId]: [...(state.messagesByTask[taskId] || []), message],
      },
    })),

  removeTaskMessage: (taskId, messageId) =>
    set((state) => ({
      messagesByTask: {
        ...state.messagesByTask,
        [taskId]: (state.messagesByTask[taskId] || []).filter((m) => m.id !== messageId),
      },
    })),
}));
