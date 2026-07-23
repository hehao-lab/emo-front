import { Avatar, Button, Card, Drawer, List, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, MessageSquareText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchSessionMessages, fetchSessions } from "../api/chat";
import type { ChatMessage, ChatSession } from "../types";

const columns: ColumnsType<ChatSession> = [
  {
    title: "会话",
    key: "session",
    width: 220,
    render: (_, record) => (
      <div>
        <Typography.Text strong>{record.title}</Typography.Text>
        <div className="muted-text">{record.username}</div>
      </div>
    ),
  },
  { title: "场景", dataIndex: "scenario", key: "scenario", width: 160 },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (v) => <Tag color={v === "active" ? "processing" : "default"}>{v === "active" ? "活跃" : "关闭"}</Tag>,
  },
  {
    title: "消息数",
    dataIndex: "messageCount",
    key: "messageCount",
    width: 100,
    render: (v?: number) => v ?? 0,
  },
  {
    title: "最后消息",
    dataIndex: "lastMessageAt",
    key: "lastMessageAt",
    width: 160,
    render: (v?: string) => v && v !== "0" ? new Date(Number(v) * 1000).toLocaleString() : "-",
  },
];

export function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { sessions: list, total: t } = await fetchSessions({ page, pageSize: 20 });
      setSessions(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const openMessages = async (session: ChatSession) => {
    setSelectedSession(session);
    setMsgLoading(true);
    try {
      const { messages: list } = await fetchSessionMessages(session.id, { pageSize: 200 });
      setMessages(list);
    } finally {
      setMsgLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <Card title={<Space><MessageSquareText size={18} />会话列表</Space>}>
        <Table<ChatSession>
          rowKey="id"
          columns={[...columns, {
            title: "操作", key: "actions", width: 88, fixed: "right",
            render: (_, record) => (
              <Tooltip title="查看消息">
                <span><Button icon={<Eye size={16} />} onClick={() => openMessages(record)} /></span>
              </Tooltip>
            ),
          }]}
          dataSource={sessions}
          loading={loading}
          scroll={{ x: 980 }}
          pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }}
        />
      </Card>

      <Drawer
        title={selectedSession?.title || "会话详情"}
        width={620}
        open={!!selectedSession}
        onClose={() => { setSelectedSession(null); setMessages([]); }}
      >
        {selectedSession && (
          <div className="drawer-stack">
            <Typography.Paragraph type="secondary">
              用户: {selectedSession.username} | 场景: {selectedSession.scenario} | 状态: {selectedSession.status}
            </Typography.Paragraph>
            <List
              loading={msgLoading}
              itemLayout="vertical"
              dataSource={messages}
              renderItem={(msg) => (
                <List.Item className={`message-item message-${msg.role}`}>
                  <List.Item.Meta
                    avatar={<Avatar>{msg.role.slice(0, 1).toUpperCase()}</Avatar>}
                    title={
                      <Space>
                        <span>{msg.role}</span>
                        <Typography.Text type="secondary">{new Date(Number(msg.createdAt) * 1000).toLocaleString()}</Typography.Text>
                      </Space>
                    }
                  />
                  <Typography.Paragraph>{msg.content}</Typography.Paragraph>
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
