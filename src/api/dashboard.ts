import { apiClient } from "./client";
import type { DashboardOverview, TrendPoint } from "../types";

export async function fetchOverview(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<DashboardOverview>("/v1/admin/dashboard/overview");
  return data;
}

export async function fetchTrends(startDate: string, endDate: string) {
  const { data } = await apiClient.get<{ points: TrendPoint[] }>(
    "/v1/admin/dashboard/trends",
    { params: { startDate, endDate } },
  );
  return data;
}
