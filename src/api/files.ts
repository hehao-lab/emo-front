import { apiClient } from "./client";
import type { FileAsset } from "../types";

export interface FileListResponse {
  files: FileAsset[];
  total: string;
}

export async function fetchFiles(params: {
  page?: number;
  pageSize?: number;
  bizType?: string;
  ownerUserId?: string;
}): Promise<FileListResponse> {
  const { data } = await apiClient.get<FileListResponse>("/v1/admin/files", { params });
  return data;
}

export async function fetchFileDetail(id: string): Promise<FileAsset> {
  const { data } = await apiClient.get<FileAsset>(`/v1/admin/files/${id}`);
  return data;
}

export async function deleteFile(id: string) {
  await apiClient.delete(`/v1/admin/files/${id}`);
}
