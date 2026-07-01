import { Card, Space, Typography } from "antd";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  note: string;
  icon: ReactNode;
  tone: "blue" | "green" | "orange" | "red";
}

export function StatCard({ title, value, note, icon, tone }: StatCardProps) {
  return (
    <Card className={`stat-card stat-card-${tone}`}>
      <Space align="start" className="stat-card-content">
        <div className="stat-card-icon">{icon}</div>
        <div>
          <Typography.Text type="secondary">{title}</Typography.Text>
          <Typography.Title level={3}>{value}</Typography.Title>
          <Typography.Text className="stat-note">{note}</Typography.Text>
        </div>
      </Space>
    </Card>
  );
}
