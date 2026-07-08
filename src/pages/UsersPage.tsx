import {
  App,
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Ban, Eye, Key, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchUserDetail, fetchUsers, updateUserPassword, updateUserStatus } from "../api/users";
import type { AdminUser, UserDetailResponse } from "../types";

const statusLabel: Record<number, string> = { 1: "正常", 2: "冻结", 3: "注销" };
const statusColor: Record<number, string> = { 1: "success", 2: "warning", 3: "default" };

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);
  const [passwordForm] = Form.useForm();
  const { message } = App.useApp();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { users: list, total: t } = await fetchUsers({
        page,
        pageSize: 20,
        keyword: keyword || undefined,
        status: statusFilter,
      });
      setUsers(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page, keyword, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openDetail = async (userId: string) => {
    try {
      const detail = await fetchUserDetail(userId);
      setSelectedUser(detail);
      setDetailOpen(true);
    } catch {
      message.error("获取用户详情失败");
    }
  };

  const handleStatusChange = async (userId: string, status: number, reason?: string) => {
    try {
      await updateUserStatus(userId, status, reason);
      message.success(status === 2 ? "账号已冻结" : "账号已恢复");
      loadUsers();
    } catch {
      message.error("操作失败");
    }
  };

  const openPasswordModal = (user: AdminUser) => {
    setPasswordTarget(user);
    passwordForm.resetFields();
    setPasswordModalOpen(true);
  };

  const handlePasswordChange = async () => {
    const { newPassword } = await passwordForm.validateFields();
    if (!passwordTarget) return;
    try {
      await updateUserPassword(passwordTarget.userId, newPassword);
      message.success(`${passwordTarget.username} 的密码已修改`);
      setPasswordModalOpen(false);
      setPasswordTarget(null);
      passwordForm.resetFields();
    } catch {
      message.error("密码修改失败");
    }
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: "用户",
      key: "user",
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar}>{record.username?.slice(0, 1).toUpperCase()}</Avatar>
          <div>
            <Typography.Text strong>{record.profile?.nickname || record.username}</Typography.Text>
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
      title: "角色",
      dataIndex: "roles",
      key: "roles",
      width: 120,
      render: (roles: string[]) => roles.join(", "),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v: number) => {
        const colorMap: Record<number, "success" | "warning" | "default"> = { 1: "success", 2: "warning", 3: "default" };
        return <span className={`ant-tag ant-tag-${colorMap[v] || "default"}`}>{statusLabel[v] || v}</span>;
      },
    },
    {
      title: "最后登录",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 160,
      render: (v: string) => v ? new Date(Number(v) * 1000).toLocaleString() : "-",
    },
    {
      title: "操作",
      key: "actions",
      width: 172,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="查看">
            <Button icon={<Eye size={16} />} onClick={() => openDetail(record.userId)} />
          </Tooltip>
          <Tooltip title="改密">
            <Button icon={<Key size={16} />} onClick={() => openPasswordModal(record)} />
          </Tooltip>
          {record.status === 2 ? (
            <Tooltip title="恢复">
              <Button icon={<RotateCcw size={16} />} onClick={() => handleStatusChange(record.userId, 1)} />
            </Tooltip>
          ) : (
            <Tooltip title="冻结">
              <Button danger icon={<Ban size={16} />} onClick={() => handleStatusChange(record.userId, 2, "违规冻结")} />
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
            placeholder="搜索用户名、手机号、邮箱"
            allowClear
            onSearch={(v) => { setKeyword(v); setPage(1); }}
            onChange={(e) => { if (!e.target.value) { setKeyword(""); setPage(1); } }}
          />
          <Select
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            allowClear
            placeholder="全部状态"
            style={{ width: 120 }}
            options={[
              { value: 1, label: "正常" },
              { value: 2, label: "冻结" },
              { value: 3, label: "注销" },
            ]}
          />
        </Space>
      </Card>

      <Card>
        <Table<AdminUser>
          rowKey="userId"
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 980 }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </Card>

      <Modal
        title={`修改密码 - ${passwordTarget?.username || ""}`}
        open={passwordModalOpen}
        onCancel={() => { setPasswordModalOpen(false); setPasswordTarget(null); passwordForm.resetFields(); }}
        onOk={handlePasswordChange}
        okText="确认修改"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical" requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码至少 6 位" },
            ]}
          >
            <Input.Password size="large" placeholder="输入新密码" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="用户详情" width={520} open={detailOpen} onClose={() => setDetailOpen(false)}>
        {selectedUser && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="用户 ID">{selectedUser.userId}</Descriptions.Item>
            <Descriptions.Item label="昵称">{selectedUser.profile?.nickname || "-"}</Descriptions.Item>
            <Descriptions.Item label="账号">{selectedUser.username}</Descriptions.Item>
            <Descriptions.Item label="手机号">{selectedUser.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="性别">{selectedUser.profile?.gender || "-"}</Descriptions.Item>
            <Descriptions.Item label="生日">{selectedUser.profile?.birthday || "-"}</Descriptions.Item>
            <Descriptions.Item label="所在地">{selectedUser.profile?.location || "-"}</Descriptions.Item>
            <Descriptions.Item label="职业">{selectedUser.profile?.occupation || "-"}</Descriptions.Item>
            <Descriptions.Item label="行业">{selectedUser.profile?.industry || "-"}</Descriptions.Item>
            <Descriptions.Item label="简介">{selectedUser.profile?.bio || "-"}</Descriptions.Item>
            <Descriptions.Item label="角色">{selectedUser.roles.join(", ")}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <span className={`ant-tag ant-tag-${statusColor[selectedUser.status]}`}>{statusLabel[selectedUser.status]}</span>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(Number(selectedUser.createdAt) * 1000).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="最后登录">{selectedUser.lastLoginAt ? new Date(Number(selectedUser.lastLoginAt) * 1000).toLocaleString() : "-"}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
