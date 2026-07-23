import { apiClient, saveToken, saveRefreshToken, saveProfile, readProfile } from "./client";
import type { LoginResponse } from "../types";

export interface AdminProfile {
  userId: string;
  username: string;
  avatar: string;
  roles: string[];
}

interface LoginPayload {
  phone: string;
  password: string;
}

export { readProfile, saveProfile };

export async function login(payload: LoginPayload): Promise<AdminProfile> {
  const { data } = await apiClient.post<LoginResponse>("/v1/users/login", payload);

  // 防御：data 可能为 null / undefined（后端返回业务错误码时）
  if (!data || typeof data !== "object") {
    console.error("[login] unexpected response data:", data);
    throw new Error("登录失败，服务器返回了无效的响应数据");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as Record<string, any>;
  const accessToken = data.accessToken || raw.access_token;
  if (!accessToken) {
    console.error("[login] no accessToken found in:", data);
    throw new Error("登录失败，未获取到 token，请检查账号和密码");
  }

  saveToken(accessToken);
  saveRefreshToken(data.refreshToken || raw.refresh_token);

  const profile: AdminProfile = {
    userId: data.userId || raw.user_id || "0",
    username: data.username || "admin",
    avatar: data.avatar || "",
    roles: data.roles?.length ? data.roles : ["admin"],
  };
  saveProfile(profile);
  return profile;
}

export async function refreshToken(refreshToken: string) {
  const { data } = await apiClient.post("/v1/auth/refresh", { refreshToken });
  saveToken(data.accessToken);
  saveRefreshToken(data.refreshToken);
  return data;
}

export async function logout(refreshToken: string) {
  await apiClient.post("/v1/auth/logout", { refreshToken });
}
