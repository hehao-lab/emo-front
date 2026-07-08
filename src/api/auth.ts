import { apiClient, saveToken, saveRefreshToken, saveProfile, readProfile } from "./client";
import type { LoginResponse, UserDetailResponse } from "../types";

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

  console.log("[login] raw response data:", data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as Record<string, any>;
  const accessToken = data.accessToken || raw.access_token;
  if (!accessToken) {
    console.error("[login] no accessToken found in:", data);
    throw new Error("missing access token");
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
  console.log("[login] saved profile:", profile);
  return profile;
}

export async function fetchCurrentUser(): Promise<UserDetailResponse> {
  const { data } = await apiClient.get<UserDetailResponse>("/v1/users/me");
  return data;
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
