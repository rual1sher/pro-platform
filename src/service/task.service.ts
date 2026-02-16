import axios from "axios";
import type { ITaskRequest } from "../types/type";
import { env } from "../config/env.config";
import { toast } from "react-toastify";
import { getToken } from "../components/helper/tokens";

export async function create(task: ITaskRequest) {
  const token = getToken();
  try {
    const { data } = await axios.post(env.baseUrl + "/tasks", task, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  } catch (err: any) {
    toast.error(err.message || "Что-то пошло не так");
  }
}

export async function findAll(params: { user_id?: number }) {
  const token = getToken();
  try {
    return (
      await axios.get(env.baseUrl + "/tasks", {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  } catch (err: any) {
    toast.error(err.message || "Что-то пошло не так");
  }
}

export async function remove(id: number) {
  const token = getToken();
  try {
    return (
      await axios.delete(env.baseUrl + "/tasks/" + id, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  } catch (err: any) {
    toast.error(err.message || "Что-то пошло не так");
  }
}

export async function update(id: number, data: any) {
  const token = getToken();
  try {
    return (
      await axios.patch(env.baseUrl + "/tasks/" + id, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  } catch (err: any) {
    toast.error(err.message || "Что-то пошло не так");
  }
}
