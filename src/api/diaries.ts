import { apiClient } from "./client";
import type { DiaryRecord } from "../types";

export interface DiaryListResponse {
  diaries: DiaryRecord[];
  total: string;
}

export interface DiaryListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  userId?: string;
  mood?: string;
  startDate?: string;
  endDate?: string;
}

export async function fetchDiaries(params: DiaryListParams): Promise<DiaryListResponse> {
  const { data } = await apiClient.get<DiaryListResponse>("/v1/admin/diaries", { params });
  return data;
}

export async function fetchDiaryDetail(id: string): Promise<DiaryRecord> {
  const { data } = await apiClient.get<DiaryRecord>(`/v1/admin/diaries/${id}`);
  return data;
}

export async function deleteDiary(id: string) {
  await apiClient.delete(`/v1/admin/diaries/${id}`);
}
