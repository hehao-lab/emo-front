import { apiClient } from "./client";
import type { MoodTag } from "../types";

export interface MoodTagListResponse {
  tags: MoodTag[];
  total: string;
}

export async function fetchMoodTags(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<MoodTagListResponse> {
  const { data } = await apiClient.get<MoodTagListResponse>("/v1/admin/mood-tags", { params });
  return data;
}

export async function createMoodTag(body: Partial<MoodTag>): Promise<MoodTag> {
  const { data } = await apiClient.post<MoodTag>("/v1/admin/mood-tags", body);
  return data;
}

export async function updateMoodTag(id: string, body: Partial<MoodTag>): Promise<MoodTag> {
  const { data } = await apiClient.patch<MoodTag>(`/v1/admin/mood-tags/${id}`, body);
  return data;
}

export async function deleteMoodTag(id: string) {
  await apiClient.delete(`/v1/admin/mood-tags/${id}`);
}
