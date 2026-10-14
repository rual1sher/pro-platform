import axios from "axios";
import type { IRegister, ILogin, IUser } from "../types";
import { env } from "../config/env.config";
import { toast } from "react-toastify";
import { getToken, removeToken } from "../components/helper/tokens";

export async function register(data: Omit<IRegister, "remember">) {
  try {
    const res = await axios.post(`${env.baseUrl}/auth/register`, data);
    toast.success("Регистрация успешна!");
    return res.data;
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || "Ошибка регистрации";
    toast.error(msg);
    return null;
  }
}

export async function login(data: Omit<ILogin, "remember">) {
  try {
    const res = await axios.post(`${env.baseUrl}/auth/login`, data);
    toast.success("Вход выполнен успешно!");
    return res.data;
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || "Ошибка входа в систему";
    toast.error(msg);
    return null;
  }
}

export async function me(): Promise<IUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const { data } = await axios.get(`${env.baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (err: any) {
    if (err.response?.status === 401) {
      removeToken();
    }
    return null;
  }
}
