import {
  App,
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Ban, Eye, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountStatusTag, RiskTag } from "../components/StatusTags";
import { users as initialUsers } from "../data/mock";
import type { AccountStatus, AdminUser } from "../types";

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<AccountStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { message } = App.useApp();

  const filteredUsers = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return users.filter((user) => {
      const matchesKeyword =
        !value ||
        user.username.toLowerCase().includes(value) ||
        user.nickname.toLowerCase().includes(value) ||
        user.phone.includes(value) ||
        user.email.toLowerCase().includes(value);
      const matchesStatus = status === "all" || user.status === status;
      return matchesKeyword && matchesStatus;
    });
  }, [keyword, status, users]);

  const updateStatus = (id: number, nextStatus: AccountStatus) => {
    setUsers((items) => items.map((user) => (user.id === id ? { ...user, status: nextStatus } : user)));
    message.success(nextStatus === "frozen" ? "账号已冻结" : "账号已恢复");
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: "用户",
      key: "user",
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar}>{record.nickname.slice(0, 1)}</Avatar>
          <div>
            <Typography.Text strong>{record.nickname}</Typography.Text>
            <div className="muted-text">{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "联系方式",
      key: "contact",
      width: 220,
      render: (_, record) => (
        <div>
          <div>{record.phone}</div>
          <div className="muted-text">{record.email}</div>
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value) => <AccountStatusTag value={value} />,
    },
    {
      title: "风险",
      dataIndex: "riskLevel",
      key: "riskLevel",
      width: 100,
      render: (value) => <RiskTag value={value} />,
    },
    {
      title: "日记 / 会话",
      key: "activity",
      width: 140,
      render: (_, record) => `${record.diaryCount} / ${record.chatCount}`,
    },
    {
      title: "最后登录",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 160,
    },
    {
      title: "操作",
      key: "actions",
      width: 132,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="查看">
            <Button icon={<Eye size={16} />} onClick={() => setSelectedUser(record)} />
          </Tooltip>
          {record.status === "frozen" ? (
            <Tooltip title="恢复">
              <Button icon={<RotateCcw size={16} />} onClick={() => updateStatus(record.id, "active")} />
            </Tooltip>
          ) : (
            <Tooltip title="冻结">
              <Button danger icon={<Ban size={16} />} onClick={() => updateStatus(record.id, "frozen")} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <Card>
        <Space className="table-toolbar" size={12}>
          <Input.Search
            placeholder="搜索用户名、昵称、手机号"
            allowClear
            onSearch={setKeyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "全部状态" },
              { value: "active", label: "正常" },
              { value: "frozen", label: "冻结" },
              { value: "closed", label: "注销" },
            ]}
          />
        </Space>
      </Card>

      <Card>
        <Table<AdminUser>
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          scroll={{ x: 980 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>

      <Drawer
        title="用户详情"
        width={520}
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
      >
        {selectedUser && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="用户 ID">{selectedUser.id}</Descriptions.Item>
            <Descriptions.Item label="昵称">{selectedUser.nickname}</Descriptions.Item>
            <Descriptions.Item label="账号">{selectedUser.username}</Descriptions.Item>
            <Descriptions.Item label="手机号">{selectedUser.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="所在地">{selectedUser.location}</Descriptions.Item>
            <Descriptions.Item label="角色">{selectedUser.roles.join(", ")}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <AccountStatusTag value={selectedUser.status} />
            </Descriptions.Item>
            <Descriptions.Item label="风险">
              <RiskTag value={selectedUser.riskLevel} />
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedUser.createdAt}</Descriptions.Item>
            <Descriptions.Item label="最后登录">{selectedUser.lastLoginAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
