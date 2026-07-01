export type AccountStatus = "active" | "frozen" | "closed";
export type RiskLevel = "low" | "medium" | "high" | "crisis";
export type Platform = "all" | "ios" | "android" | "web";

export interface AdminUser {
  id: number;
  username: string;
  phone: string;
  email: string;
  nickname: string;
  avatar: string;
  roles: string[];
  status: AccountStatus;
  location: string;
  lastLoginAt: string;
  createdAt: string;
  diaryCount: number;
  chatCount: number;
  riskLevel: RiskLevel;
}

export interface DiaryRecord {
  id: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  mood: string;
  moodScore: number;
  riskLevel: RiskLevel;
  tags: string[];
  occurredOn: string;
  createdAt: string;
  visibility: string;
}

export interface EmotionAnalysis {
  id: number;
  userId: number;
  username: string;
  sourceType: "diary" | "chat_message" | "manual";
  primaryEmotion: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  stressScore: number;
  anxietyScore: number;
  depressionRiskScore: number;
  energyScore: number;
  confidence: number;
  riskLevel: RiskLevel;
  summary: string;
  advice: string;
  createdAt: string;
}

export interface ChatSession {
  id: number;
  userId: number;
  username: string;
  title: string;
  scenario: string;
  status: "active" | "closed";
  summary: string;
  messageCount: number;
  lastMessageAt: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  latencyMs?: number;
  totalTokens?: number;
  status: "success" | "failed";
  createdAt: string;
}

export interface LoginLog {
  id: number;
  username: string;
  success: boolean;
  failReason: string;
  ip: string;
  userAgent: string;
  deviceId: string;
  location: string;
  createdAt: string;
}

export interface SecurityEvent {
  id: number;
  username: string;
  eventType: string;
  riskLevel: RiskLevel;
  ip: string;
  metadata: string;
  createdAt: string;
}

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description: string;
  isPublic: boolean;
  updatedAt: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  platform: Platform;
  status: "enabled" | "disabled";
  startAt: string;
  endAt: string;
}

export interface AppVersion {
  id: number;
  platform: Exclude<Platform, "all">;
  version: string;
  buildNo: number;
  forceUpdate: boolean;
  minSupportedVersion: string;
  publishedAt: string;
}

export interface FileAsset {
  id: number;
  ownerUserId: number;
  ownerName: string;
  bizType: string;
  storageProvider: string;
  objectKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  status: "normal" | "blocked";
  createdAt: string;
}
