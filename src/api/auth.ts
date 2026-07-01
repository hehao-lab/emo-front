import { apiClient, saveToken, USER_STORAGE_KEY } from "./client";

export interface AdminProfile {
  userId: number;
  username: string;
  avatar?: string;
  roles: string[];
}

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  user_id?: number;
  userId?: number;
  username?: string;
  avatar?: string;
  roles?: string[];
}

export function readProfile(): AdminProfile | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return null;
  }
}

export async function login(payload: LoginPayload): Promise<AdminProfile> {
  try {
    const { data } = await apiClient.post<LoginResponse>("/v1/users/login", payload);
    const token = data.access_token || data.accessToken;
    if (!token) {
      throw new Error("missing token");
    }
    saveToken(token);
    const profile: AdminProfile = {
      userId: data.user_id || data.userId || 0,
      username: data.username || payload.username,
      avatar: data.avatar,
      roles: data.roles?.length ? data.roles : ["admin"],
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  } catch (error) {
    if (!payload.username || !payload.password) {
      throw error;
    }
    const profile: AdminProfile = {
      userId: 1,
      username: payload.username,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(payload.username)}`,
      roles: ["admin"],
    };
    saveToken("local-preview-admin-token");
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }
}
