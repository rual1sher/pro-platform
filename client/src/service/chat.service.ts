import axios from "axios";
import type { IMessage, IMessageRequest } from "../types";
import { env } from "../config/env.config";
import { toast } from "react-toastify";
import { getToken } from "../components/helper/tokens";
import { removeMessage } from "./message.service";

function getHeaders() {
  const token = getToken();
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
}

export async function getOrgChatMessages(organizationId: number): Promise<IMessage[]> {
  try {
    const { data } = await axios.get(
      `${env.baseUrl}/organizations/${organizationId}/chat`,
      getHeaders(),
    );
    return data || [];
  } catch (err: any) {
    console.error("Ошибка загрузки чата:", err);
    return [];
  }
}

export async function sendOrgChatMessage(
  organizationId: number,
  message: IMessageRequest,
): Promise<IMessage | null> {
  try {
    const { data } = await axios.post(
      `${env.baseUrl}/organizations/${organizationId}/chat`,
      message,
      getHeaders(),
    );
    return data;
  } catch (err: any) {
    toast.error(
      err.response?.data?.error || err.message || "Не удалось отправить сообщение",
    );
    return null;
  }
}

// Delete works the same way for chat messages and task comments (shared /messages/:id endpoint)
export const removeChatMessage = removeMessage;
