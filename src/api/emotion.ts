import { apiClient } from "./client";
import type { EmotionAnalysis } from "../types";

export interface AnalysisListResponse {
  analyses: EmotionAnalysis[];
  total: string;
}

export interface AnalysisListParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  riskLevel?: string;
  sourceType?: string;
}

export async function fetchAnalyses(params: AnalysisListParams): Promise<AnalysisListResponse> {
  const { data } = await apiClient.get<AnalysisListResponse>("/v1/admin/emotion/analyses", { params });
  return data;
}

export async function fetchAnalysisDetail(id: string): Promise<EmotionAnalysis> {
  const { data } = await apiClient.get<EmotionAnalysis>(`/v1/admin/emotion/analyses/${id}`);
  return data;
}
