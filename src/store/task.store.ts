import { create } from "zustand";
import type { ITaskResponce } from "../types/type";

interface ITasts {
  tasks: ITaskResponce[];
  setTasks: (t: ITaskResponce[]) => void;
  setTask: (t: ITaskResponce) => void;
}

export const useTask = create<ITasts>((set) => ({
  tasks: [],
  setTasks: (t) => set(() => ({ tasks: t })),
  setTask: (t) => set((state) => ({ tasks: [...state.tasks, t] })),
}));
