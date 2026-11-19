import axios from "axios";
import { env } from "../config/env.config";
import { getToken } from "../components/helper/tokens";
import { toast } from "react-toastify";
import type { IOrganization, IOrganizationMember, IUser } from "../types";

function getHeaders() {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getOrganizations(): Promise<IOrganization[]> {
  try {
    const { data } = await axios.get(`${env.baseUrl}/organizations`, getHeaders());
    return data;
  } catch (err: any) {
    console.error("Ошибка загрузки организаций:", err);
    return [];
  }
}

export async function createOrganization(org: {
  name: string;
  description?: string;
}): Promise<IOrganization | null> {
  try {
    const { data } = await axios.post(`${env.baseUrl}/organizations`, org, getHeaders());
    toast.success("Организация успешно создана!");
    return data;
  } catch (err: any) {
    toast.error(
      err.response?.data?.error || err.message || "Не удалось создать организацию",
    );
    return null;
  }
}

export async function getOrganization(id: number): Promise<IOrganization | null> {
  try {
    const { data } = await axios.get(`${env.baseUrl}/organizations/${id}`, getHeaders());
    return data;
  } catch (err: any) {
    console.error("Ошибка загрузки организации:", err);
    return null;
  }
}

export async function getOrganizationMembers(id: number): Promise<IOrganizationMember[]> {
  try {
    const { data } = await axios.get(
      `${env.baseUrl}/organizations/${id}/members`,
      getHeaders(),
    );
    return data;
  } catch (err: any) {
    console.error("Ошибка загрузки участников:", err);
    return [];
  }
}

export async function addOrganizationMember(
  orgId: number,
  member: { userId?: number; email?: string; role?: string },
): Promise<IOrganizationMember | null> {
  try {
    const { data } = await axios.post(
      `${env.baseUrl}/organizations/${orgId}/members`,
      member,
      getHeaders(),
    );
    toast.success("Сотрудник добавлен в команду!");
    return data;
  } catch (err: any) {
    toast.error(
      err.response?.data?.error || err.message || "Ошибка добавления сотрудника",
    );
    return null;
  }
}

export async function removeOrganizationMember(
  orgId: number,
  userId: number,
): Promise<boolean> {
  try {
    await axios.delete(
      `${env.baseUrl}/organizations/${orgId}/members/${userId}`,
      getHeaders(),
    );
    toast.info("Сотрудник удален из команды");
    return true;
  } catch (err: any) {
    toast.error(err.response?.data?.error || err.message || "Ошибка удаления сотрудника");
    return false;
  }
}

export async function getAllUsers(): Promise<IUser[]> {
  try {
    const { data } = await axios.get(`${env.baseUrl}/users`, getHeaders());
    return data;
  } catch (err: any) {
    console.error("Ошибка получения пользователей:", err);
    return [];
  }
}
