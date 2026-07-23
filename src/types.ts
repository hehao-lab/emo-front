export type AccountStatus = "active" | "frozen" | "closed";
export type RiskLevel = "low" | "medium" | "high" | "crisis";
export type Platform = "all" | "ios" | "android" | "web";

export interface AdminUser {
  userId: string;
  username: string;
  phone: string;
  email: string;
  avatar: string;
  roles: string[];
  status: number; // 1=正常 2=冻结 3=注销
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  nickname: string;
  gender: string;
  birthday: string;
  bio: string;
  location: string;
  occupation: string;
  industry: string;
  language: string;
  timezone: string;
}

export interface DiaryRecord {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  mood: string;
  moodScore?: number;
  occurredOn: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  tags?: MoodTag[];
  attachmentUrls?: string[];
}

export interface EmotionDimensionScore {
  dimension: string;
  score: number;
}

export interface EmotionAnalysis {
  id: string;
  userId: string;
  username: string;
  sourceType: "diary" | "chat_message" | "manual";
  sourceId: string;
  primaryEmotion: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  stressScore: number;
  anxietyScore: number;
  depressionRiskScore: number;
  energyScore: number;
  confidence: number;
  summary: string;
  advice: string;
  riskLevel: RiskLevel;
  model: string;
  createdAt: string;
  dimensions?: EmotionDimensionScore[];
}

export interface ChatSession {
  id: string;
  userId: string;
  username: string;
  title: string;
  scenario: string;
  status: "active" | "closed";
  messageCount?: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: "user" | "assistant" | "system";
  content: string;
  contentType: string;
  status: "success" | "failed";
  createdAt: string;
}

export interface LoginLog {
  id: string;
  userId: string;
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
  id: string;
  userId: string;
  username: string;
  eventType: string;
  riskLevel: RiskLevel;
  ip: string;
  userAgent: string;
  metadataJson: string;
  createdAt: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  valueJson: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetPlatform: Platform;
  startAt: string;
  endAt: string;
  status: number; // 1=启用 0=停用
  createdAt: string;
  updatedAt: string;
}

export interface AppVersion {
  id: string;
  platform: Exclude<Platform, "all">;
  version: string;
  buildNo: number;
  forceUpdate: boolean;
  downloadUrl: string;
  changelog: string;
  minSupportedVersion: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileAsset {
  id: string;
  ownerUserId: string;
  bizType: string;
  storageProvider: string;
  bucket: string;
  objectKey: string;
  url: string;
  mimeType: string;
  sizeBytes: string;
  checksum: string;
  username?: string;
  status: number; // 1=正常 0=拦截
  createdAt: string;
  updatedAt: string;
}

export interface MoodTag {
  id: string;
  name: string;
  color: string;
  icon: string;
  sort: number;
  system: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  userCount: string;
  todayNewUsers: string;
  diaryCount: string;
  todayDiaries: string;
  chatSessionCount: string;
  todayChatMessages: string;
  emotionAnalysisCount: string;
  highRiskAnalysisCount: string;
}

export interface TrendPoint {
  date: string;
  newUsers: string;
  diaries: string;
  chatMessages: string;
  emotionAnalyses: string;
}

export interface PaginatedResponse<T> {
  total: string;
  [key: string]: T[] | string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  username: string;
  avatar: string;
  roles: string[];
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface UserDetailResponse extends AdminUser {
  profile?: UserProfile;
}
