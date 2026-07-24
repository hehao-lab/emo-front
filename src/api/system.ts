import { apiClient } from "./client";
import type { SystemConfig, Announcement, AppVersion } from "../types";

export interface ConfigListResponse {
  configs: SystemConfig[];
  total: string;
}

export interface PublicConfig {
  key: string;
  valueJson: string;
  description: string;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  total: string;
}

export interface VersionListResponse {
  versions: AppVersion[];
  total: string;
}

// System Configs
export async function fetchConfigs(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isPublic?: boolean;
}): Promise<ConfigListResponse> {
  const { data } = await apiClient.get<Partial<ConfigListResponse>>("/v1/admin/system/configs", { params });
  return {
    configs: Array.isArray(data.configs) ? data.configs : [],
    total: data.total || "0",
  };
}

export async function createConfig(body: Partial<SystemConfig>): Promise<SystemConfig> {
  const { data } = await apiClient.post<SystemConfig>("/v1/admin/system/configs", body);
  return data;
}

export async function updateConfig(id: string, body: Partial<SystemConfig>): Promise<SystemConfig> {
  const { data } = await apiClient.patch<SystemConfig>(`/v1/admin/system/configs/${id}`, body);
  return data;
}

export async function deleteConfig(id: string) {
  await apiClient.delete(`/v1/admin/system/configs/${id}`);
}

export async function fetchPublicConfigs(): Promise<PublicConfig[]> {
  const { data } = await apiClient.get<{ configs?: PublicConfig[] }>("/v1/system/configs/public");
  return Array.isArray(data.configs) ? data.configs : [];
}

// Announcements
export async function fetchAnnouncements(params: {
  page?: number;
  pageSize?: number;
  platform?: string;
  status?: number;
}): Promise<AnnouncementListResponse> {
  const { data } = await apiClient.get<AnnouncementListResponse>("/v1/admin/system/announcements", {
    params: { ...params, filterStatus: params.status !== undefined },
  });
  return data;
}

export async function createAnnouncement(body: Partial<Announcement>): Promise<Announcement> {
  const { data } = await apiClient.post<Announcement>("/v1/admin/system/announcements", body);
  return data;
}

export async function updateAnnouncement(id: string, body: Partial<Announcement>): Promise<Announcement> {
  const { data } = await apiClient.patch<Announcement>(`/v1/admin/system/announcements/${id}`, body);
  return data;
}

export async function deleteAnnouncement(id: string) {
  await apiClient.delete(`/v1/admin/system/announcements/${id}`);
}

// App Versions
export async function fetchVersions(params: {
  page?: number;
  pageSize?: number;
  platform?: string;
}): Promise<VersionListResponse> {
  const { data } = await apiClient.get<VersionListResponse>("/v1/admin/system/versions", { params });
  return data;
}

export async function fetchLatestVersion(params: { platform: Exclude<AppVersion["platform"], "all"> }): Promise<AppVersion | null> {
  const { data } = await apiClient.get<Partial<AppVersion>>("/v1/system/versions/latest", { params });
  return data.version ? data as AppVersion : null;
}

export async function createVersion(body: Partial<AppVersion>): Promise<AppVersion> {
  const { data } = await apiClient.post<AppVersion>("/v1/admin/system/versions", body);
  return data;
}

export async function updateVersion(id: string, body: Partial<AppVersion>): Promise<AppVersion> {
  const { data } = await apiClient.patch<AppVersion>(`/v1/admin/system/versions/${id}`, body);
  return data;
}

export async function deleteVersion(id: string) {
  await apiClient.delete(`/v1/admin/system/versions/${id}`);
}
