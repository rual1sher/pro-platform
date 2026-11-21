import axios from "axios";
import type { ITaskRequest, ITaskResponce, TaskQueryParams } from "../types";
import { env } from "../config/env.config";
import { toast } from "react-toastify";
import { getToken } from "../components/helper/tokens";

export type { TaskQueryParams };

function getHeaders() {
  const token = getToken();
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
}

export async function create(task: ITaskRequest): Promise<ITaskResponce | null> {
  try {
    const { data } = await axios.post(`${env.baseUrl}/tasks`, task, getHeaders());
    toast.success("Задача успешно создана");
    return data;
  } catch (err: any) {
    toast.error(err.response?.data?.error || err.message || "Не удалось создать задачу");
    return null;
  }
}

export async function findAll(params?: TaskQueryParams): Promise<ITaskResponce[]> {
  try {
    const { data } = await axios.get(`${env.baseUrl}/tasks`, {
      params,
      ...getHeaders(),
    });
    return data || [];
  } catch (err: any) {
    console.error("Ошибка загрузки задач:", err);
    return [];
  }
}

export async function getById(id: number): Promise<ITaskResponce | null> {
  try {
    const { data } = await axios.get(`${env.baseUrl}/tasks/${id}`, getHeaders());
    return data;
  } catch (err: any) {
    console.error("Ошибка загрузки задачи:", err);
    return null;
  }
}

export async function remove(id: number): Promise<boolean> {
  try {
    await axios.delete(`${env.baseUrl}/tasks/${id}`, getHeaders());
    toast.info("Задача удалена");
    return true;
  } catch (err: any) {
    toast.error(err.response?.data?.error || err.message || "Ошибка при удалении задачи");
    return false;
  }
}

export async function update(
  id: number,
  data: Partial<ITaskRequest>,
): Promise<ITaskResponce | null> {
  try {
    const res = await axios.patch(`${env.baseUrl}/tasks/${id}`, data, getHeaders());
    return res.data;
  } catch (err: any) {
    toast.error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Ошибка обновления задачи",
    );
    return null;
  }
}

export async function updateStatus(
  id: number,
  status: string,
  position?: number,
): Promise<ITaskResponce | null> {
  try {
    const res = await axios.patch(
      `${env.baseUrl}/tasks/${id}/status`,
      { status, position },
      getHeaders(),
    );
    return res.data;
  } catch (err: any) {
    toast.error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Ошибка смены статуса задачи",
    );
    return null;
  }
}

export async function reorderTask(
  id: number,
  position: number,
  status?: string,
): Promise<ITaskResponce | null> {
  try {
    const res = await axios.patch(
      `${env.baseUrl}/tasks/${id}/reorder`,
      { position, status },
      getHeaders(),
    );
    return res.data;
  } catch (err: any) {
    toast.error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Ошибка изменения порядка задачи",
    );
    return null;
  }
}

export async function bulkReorder(
  items: Array<{ id: number; position: number; status?: string }>,
): Promise<boolean> {
  try {
    await axios.patch(`${env.baseUrl}/tasks/reorder`, { items }, getHeaders());
    return true;
  } catch (err: any) {
    toast.error(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Ошибка сохранения порядка",
    );
    return false;
  }
}
