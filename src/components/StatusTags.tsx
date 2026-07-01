import { Tag } from "antd";
import type { AccountStatus, Platform, RiskLevel } from "../types";

const riskColor: Record<RiskLevel, string> = {
  low: "success",
  medium: "processing",
  high: "warning",
  crisis: "error",
};

const riskLabel: Record<RiskLevel, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
  crisis: "危机",
};

const accountColor: Record<AccountStatus, string> = {
  active: "success",
  frozen: "warning",
  closed: "default",
};

const accountLabel: Record<AccountStatus, string> = {
  active: "正常",
  frozen: "冻结",
  closed: "注销",
};

const platformLabel: Record<Platform, string> = {
  all: "全平台",
  ios: "iOS",
  android: "Android",
  web: "Web",
};

export function RiskTag({ value }: { value: RiskLevel }) {
  return <Tag color={riskColor[value]}>{riskLabel[value]}</Tag>;
}

export function AccountStatusTag({ value }: { value: AccountStatus }) {
  return <Tag color={accountColor[value]}>{accountLabel[value]}</Tag>;
}

export function PlatformTag({ value }: { value: Platform }) {
  return <Tag>{platformLabel[value]}</Tag>;
}
