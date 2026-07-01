import { Card, Table, Tabs, Tag, Timeline, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { RiskTag } from "../components/StatusTags";
import { loginLogs, securityEvents } from "../data/mock";
import type { LoginLog, SecurityEvent } from "../types";

const loginColumns: ColumnsType<LoginLog> = [
  { title: "用户", dataIndex: "username", key: "username", width: 120 },
  {
    title: "结果",
    dataIndex: "success",
    key: "success",
    width: 100,
    render: (value) => <Tag color={value ? "success" : "error"}>{value ? "成功" : "失败"}</Tag>,
  },
  { title: "失败原因", dataIndex: "failReason", key: "failReason", width: 140 },
  { title: "IP", dataIndex: "ip", key: "ip", width: 150 },
  { title: "设备", dataIndex: "deviceId", key: "deviceId", width: 150 },
  { title: "地区", dataIndex: "location", key: "location", width: 100 },
  { title: "客户端", dataIndex: "userAgent", key: "userAgent", ellipsis: true },
  { title: "时间", dataIndex: "createdAt", key: "createdAt", width: 160 },
];

const eventColumns: ColumnsType<SecurityEvent> = [
  { title: "用户", dataIndex: "username", key: "username", width: 120 },
  { title: "事件", dataIndex: "eventType", key: "eventType", width: 180 },
  {
    title: "风险",
    dataIndex: "riskLevel",
    key: "riskLevel",
    width: 100,
    render: (value) => <RiskTag value={value} />,
  },
  { title: "IP", dataIndex: "ip", key: "ip", width: 150 },
  { title: "元数据", dataIndex: "metadata", key: "metadata", ellipsis: true },
  { title: "时间", dataIndex: "createdAt", key: "createdAt", width: 160 },
];

export function SecurityPage() {
  return (
    <div className="page-stack">
      <Card>
        <Tabs
          items={[
            {
              key: "events",
              label: "安全事件",
              children: (
                <Table<SecurityEvent>
                  rowKey="id"
                  columns={eventColumns}
                  dataSource={securityEvents}
                  scroll={{ x: 920 }}
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                />
              ),
            },
            {
              key: "login",
              label: "登录日志",
              children: (
                <Table<LoginLog>
                  rowKey="id"
                  columns={loginColumns}
                  dataSource={loginLogs}
                  scroll={{ x: 1080 }}
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                />
              ),
            },
            {
              key: "timeline",
              label: "风险时间线",
              children: (
                <Timeline
                  className="risk-timeline"
                  items={securityEvents.map((event) => ({
                    color: event.riskLevel === "crisis" || event.riskLevel === "high" ? "red" : "blue",
                    children: (
                      <div>
                        <Typography.Text strong>{event.eventType}</Typography.Text>
                        <div className="muted-text">
                          {event.username} · {event.ip} · {event.createdAt}
                        </div>
                      </div>
                    ),
                  }))}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
