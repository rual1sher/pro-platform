import type { ReactNode } from "react";

/** Роли участника в организации */
export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";

/** Статусы задачи (0: Ожидает, 1: В работе, 2: Готово, 3: Отклонено) */
export type TaskStatusValue = "0" | "1" | "2" | "3";

/** Приоритеты задачи (0: Низкий, 1: Средний, 2: Высокий) */
export type TaskPriorityValue = "0" | "1" | "2";

/** Ключи категорий статистики задач */
export type StatKey = "pending" | "inProgress" | "done" | "rejected";

/** Метрики статистики задач */
export interface ITaskStats {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  rejected: number;
  pendingPct: number;
  inProgressPct: number;
  donePct: number;
  rejectedPct: number;
}

/** Элемент карточки статистики */
export interface IStatCardItem {
  key: StatKey;
  label: string;
  color: string;
  dot: string;
}

/** Базовые свойства для всех модальных окон */
export interface IBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Опция для селектов / выпадающих списков */
export interface IOption<T = string> {
  label: string;
  value: T;
  icon?: ReactNode;
}

/** Поле ввода для Formik-форм */
export interface IInputField {
  name: string;
  type: string;
  title: string;
}
