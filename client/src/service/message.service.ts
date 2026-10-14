import axios from "axios";
import type { IMessage, IMessageRequest } from "../types";
import { env } from "../config/env.config";
import { toast } from "react-toastify";
import { getToken } from "../components/helper/tokens";

function getHeaders() {
  const token = getToken();
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
}

export async function getTaskMessages(taskId: number): Promise<IMessage[]> {
  try {
    const { data } = await axios.get(`${env.baseUrl}/tasks/${taskId}/messages`, getHeaders());
    return data || [];
  } catch (err: any) {
    console.error("Ошибка загрузки комментариев:", err);
    return [];
  }
}

export async function createTaskMessage(taskId: number, message: IMessageRequest): Promise<IMessage | null> {
  try {
    const { data } = await axios.post(`${env.baseUrl}/tasks/${taskId}/messages`, message, getHeaders());
    return data;
  } catch (err: any) {
    toast.error(err.response?.data?.error || err.message || "Не удалось отправить комментарий");
    return null;
  }
}

export async function removeMessage(id: number): Promise<boolean> {
  try {
    await axios.delete(`${env.baseUrl}/messages/${id}`, getHeaders());
    return true;
  } catch (err: any) {
    toast.error(err.response?.data?.error || err.message || "Не удалось удалить сообщение");
    return false;
  }
}
