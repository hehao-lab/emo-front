import { Avatar, Button, Card, Drawer, List, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { sessions } from "../data/mock";
import type { ChatSession } from "../types";

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
  {
    title: "场景",
    dataIndex: "scenario",
    key: "scenario",
    width: 160,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (value) => <Tag color={value === "active" ? "processing" : "default"}>{value}</Tag>,
  },
  {
    title: "消息数",
    dataIndex: "messageCount",
    key: "messageCount",
    width: 100,
  },
  {
    title: "摘要",
    dataIndex: "summary",
    key: "summary",
    ellipsis: true,
  },
  {
    title: "最后消息",
    dataIndex: "lastMessageAt",
    key: "lastMessageAt",
    width: 160,
  },
];

export function ChatPage() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  return (
    <div className="page-stack">
      <Card
        title={
          <Space>
            <MessageSquareText size={18} />
            会话列表
          </Space>
        }
      >
        <Table<ChatSession>
          rowKey="id"
          columns={[
            ...columns,
            {
              title: "操作",
              key: "actions",
              width: 88,
              fixed: "right",
              render: (_, record) => (
                <Tooltip title="查看消息">
                  <Button icon={<Eye size={16} />} onClick={() => setSelectedSession(record)} />
                </Tooltip>
              ),
            },
          ]}
          dataSource={sessions}
          scroll={{ x: 980 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>

      <Drawer
        title={selectedSession?.title || "会话详情"}
        width={620}
        open={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
      >
        {selectedSession && (
          <div className="drawer-stack">
            <Typography.Paragraph className="detail-content">{selectedSession.summary}</Typography.Paragraph>
            <List
              itemLayout="vertical"
              dataSource={selectedSession.messages}
              renderItem={(message) => (
                <List.Item className={`message-item message-${message.role}`}>
                  <List.Item.Meta
                    avatar={<Avatar>{message.role.slice(0, 1).toUpperCase()}</Avatar>}
                    title={
                      <Space>
                        <span>{message.role}</span>
                        <Typography.Text type="secondary">{message.createdAt}</Typography.Text>
                      </Space>
                    }
                    description={message.model ? `${message.model} · ${message.latencyMs}ms · ${message.totalTokens} tokens` : ""}
                  />
                  <Typography.Paragraph>{message.content}</Typography.Paragraph>
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
