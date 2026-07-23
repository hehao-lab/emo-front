import { App, Card, Table, Tabs, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import { fetchLoginLogs, fetchSecurityEvents } from "../api/security";
import { RiskTag } from "../components/StatusTags";
import type { LoginLog, SecurityEvent } from "../types";

function formatTime(value?: string) {
  return value && value !== "0" ? new Date(Number(value) * 1000).toLocaleString() : "-";
}

function EventsTab() {
  const [items, setItems] = useState<SecurityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSecurityEvents({ page, pageSize: 20 });
      setItems(data.events || []);
      setTotal(Number(data.total));
    } catch {
      message.error("安全事件加载失败");
    } finally {
      setLoading(false);
    }
  }, [message, page]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnsType<SecurityEvent> = [
    { title: "账号", dataIndex: "username", key: "username", width: 140, render: (value) => value || "-" },
    { title: "事件", dataIndex: "eventType", key: "eventType", width: 180 },
    { title: "风险", dataIndex: "riskLevel", key: "riskLevel", width: 100, render: (value) => <RiskTag value={value} /> },
    { title: "IP", dataIndex: "ip", key: "ip", width: 160 },
    { title: "客户端", dataIndex: "userAgent", key: "userAgent", ellipsis: true },
    {
      title: "详情",
      dataIndex: "metadataJson",
      key: "metadataJson",
      ellipsis: true,
      render: (value: string) => <Typography.Text code>{value || "{}"}</Typography.Text>,
    },
    { title: "时间", dataIndex: "createdAt", key: "createdAt", width: 170, render: formatTime },
  ];

  return (
    <Table<SecurityEvent>
      rowKey="id"
      columns={columns}
      dataSource={items}
      loading={loading}
      scroll={{ x: 1120 }}
      pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }}
    />
  );
}

function LoginLogsTab() {
  const [items, setItems] = useState<LoginLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLoginLogs({ page, pageSize: 20 });
      setItems(data.logs || []);
      setTotal(Number(data.total));
    } catch {
      message.error("登录日志加载失败");
    } finally {
      setLoading(false);
    }
  }, [message, page]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnsType<LoginLog> = [
    { title: "账号", dataIndex: "username", key: "username", width: 140 },
    {
      title: "结果",
      dataIndex: "success",
      key: "success",
      width: 90,
      render: (value: boolean) => <Tag color={value ? "success" : "error"}>{value ? "成功" : "失败"}</Tag>,
    },
    { title: "失败原因", dataIndex: "failReason", key: "failReason", width: 180, render: (value) => value || "-" },
    { title: "IP", dataIndex: "ip", key: "ip", width: 160 },
    { title: "设备 ID", dataIndex: "deviceId", key: "deviceId", width: 150, render: (value) => value || "-" },
    { title: "客户端", dataIndex: "userAgent", key: "userAgent", ellipsis: true },
    { title: "时间", dataIndex: "createdAt", key: "createdAt", width: 170, render: formatTime },
  ];

  return (
    <Table<LoginLog>
      rowKey="id"
      columns={columns}
      dataSource={items}
      loading={loading}
      scroll={{ x: 1050 }}
      pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }}
    />
  );
}

export function SecurityPage() {
  return (
    <div className="page-stack">
      <Card>
        <Tabs
          items={[
            { key: "events", label: "安全事件", children: <EventsTab /> },
            { key: "login", label: "登录日志", children: <LoginLogsTab /> },
          ]}
        />
      </Card>
    </div>
  );
}
