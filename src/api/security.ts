import { apiClient } from "./client";
import type { LoginLog, SecurityEvent } from "../types";

export async function fetchLoginLogs(params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  successOnly?: boolean;
}) {
  const { data } = await apiClient.get<{ logs: LoginLog[]; total: string }>(
    "/v1/admin/security/login-logs",
    { params },
  );
  return { logs: data.logs || [], total: data.total || "0" };
}

export async function fetchSecurityEvents(params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  riskLevel?: string;
}) {
  const { data } = await apiClient.get<{ events: SecurityEvent[]; total: string }>(
    "/v1/admin/security/events",
    { params },
  );
  return { events: data.events || [], total: data.total || "0" };
}
