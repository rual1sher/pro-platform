import { create } from "zustand";
import type { ITaskResponce, IOrganizationMember } from "../types";

interface ITaskStore {
  tasks: ITaskResponce[];
  members: IOrganizationMember[];
  selectedWorkerFilter: number | null;
  selectedPriorityFilter: string | null;
  searchQuery: string;

  setTasks: (t: ITaskResponce[]) => void;
  setTask: (t: ITaskResponce) => void;
  addTask: (t: ITaskResponce) => void;
  updateTaskInStore: (id: number, updated: Partial<ITaskResponce>) => void;
  removeTaskFromStore: (id: number) => void;

  setMembers: (m: IOrganizationMember[]) => void;
  setSelectedWorkerFilter: (id: number | null) => void;
  setSelectedPriorityFilter: (p: string | null) => void;
  setSearchQuery: (q: string) => void;
}

export const useTask = create<ITaskStore>((set) => ({
  tasks: [],
  members: [],
  selectedWorkerFilter: null,
  selectedPriorityFilter: null,
  searchQuery: "",

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  setTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

  updateTaskInStore: (id, updated) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    })),

  removeTaskFromStore: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  setMembers: (members) => set({ members }),
  setSelectedWorkerFilter: (selectedWorkerFilter) => set({ selectedWorkerFilter }),
  setSelectedPriorityFilter: (selectedPriorityFilter) => set({ selectedPriorityFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
