import axios from "axios";
import type { IRegister, ILogin } from "../types/type";
import { env } from "../config/env.config";
import { toast } from "react-toastify";
import { getToken } from "../components/helper/tokens";

export async function register(data: Omit<IRegister, "remember">) {
  try {
    return (await axios.post(env.baseUrl + "/register", data)).data;
  } catch (err: any) {
    toast.error(err.message || "Что-то пошло не так");
  }
}

export async function login(data: Omit<ILogin, "remember">) {
  try {
    return (await axios.post(env.baseUrl + "/auth", data)).data;
  } catch (err: any) {
    toast.error(err.message || "Что-то пошло не так");
  }
}

export async function me() {
  const token = getToken();
  try {
    const { data } = await axios.get(env.baseUrl + "/auth_me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  } catch (err: any) {
    toast.error(err.message || "Что-то пошло не так");
  }
}
