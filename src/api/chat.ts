import { apiClient } from "./client";
import type { ChatSession, ChatMessage } from "../types";

export interface SessionListResponse {
  sessions: ChatSession[];
  total: string;
}

export interface MessageListResponse {
  messages: ChatMessage[];
  total: string;
}

export async function fetchSessions(params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  status?: string;
}): Promise<SessionListResponse> {
  const { data } = await apiClient.get<SessionListResponse>("/v1/admin/chat/sessions", { params });
  return data;
}

export async function fetchSessionMessages(
  sessionId: string,
  params?: { page?: number; pageSize?: number },
): Promise<MessageListResponse> {
  const { data } = await apiClient.get<MessageListResponse>(
    `/v1/admin/chat/sessions/${sessionId}/messages`,
    { params },
  );
  return data;
}
