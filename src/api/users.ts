import { apiClient } from "./client";
import type { AdminUser, UserDetailResponse } from "../types";

export interface UserListResponse {
  users: AdminUser[];
  total: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
  role?: string;
}

export async function fetchUsers(params: UserListParams): Promise<UserListResponse> {
  const { data } = await apiClient.get<UserListResponse>("/v1/admin/users", { params });
  return data;
}

export async function fetchUserDetail(userId: string): Promise<UserDetailResponse> {
  const { data } = await apiClient.get<UserDetailResponse>(`/v1/admin/users/${userId}`);
  return data;
}

export async function updateUserStatus(userId: string, status: number, reason?: string) {
  const { data } = await apiClient.patch(`/v1/admin/users/${userId}/status`, { status, reason });
  return data;
}

export async function updateUserRoles(userId: string, roles: string[]) {
  const { data } = await apiClient.patch(`/v1/admin/users/${userId}/roles`, { roles });
  return data;
}

export async function updateUserPassword(userId: string, password: string) {
  const { data } = await apiClient.patch(`/v1/admin/users/${userId}/password`, { password });
  return data;
}
