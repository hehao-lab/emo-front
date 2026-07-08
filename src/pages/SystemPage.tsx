import { App, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tabs, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { PlatformTag } from "../components/StatusTags";
import {
  fetchConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  fetchVersions,
  createVersion,
  updateVersion,
  deleteVersion,
} from "../api/system";
import type { Announcement, AppVersion, SystemConfig } from "../types";

/* ========== Configs Tab ========== */
function ConfigsTab() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<SystemConfig | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm<SystemConfig>();
  const { message } = App.useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { configs: list, total: t } = await fetchConfigs({ page, pageSize: 20 });
      setConfigs(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (record: SystemConfig) => {
    setEditing(record);
    form.setFieldsValue(record);
  };

  const save = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateConfig(editing.id, { valueJson: values.valueJson, description: values.description, isPublic: values.isPublic });
        message.success("配置已更新");
      } else {
        await createConfig(values);
        message.success("配置已创建");
      }
      setEditing(null);
      setCreating(false);
      form.resetFields();
      load();
    } catch {
      message.error("保存失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConfig(id);
      message.success("配置已删除");
      load();
    } catch {
      message.error("删除失败");
    }
  };

  const columns: ColumnsType<SystemConfig> = [
    { title: "配置键", dataIndex: "key", key: "key", width: 240 },
    { title: "配置值", dataIndex: "valueJson", key: "valueJson", ellipsis: true },
    { title: "说明", dataIndex: "description", key: "description", width: 220 },
    { title: "公开", dataIndex: "isPublic", key: "isPublic", width: 90, render: (v) => <Tag color={v ? "success" : "default"}>{v ? "是" : "否"}</Tag> },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 160, render: (v: string) => new Date(Number(v) * 1000).toLocaleString() },
    {
      title: "操作", key: "actions", width: 120, fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑"><Button icon={<Pencil size={16} />} onClick={() => openEdit(record)} /></Tooltip>
          <Tooltip title="删除"><Button danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space className="table-toolbar">
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreating(true)}>新建配置</Button>
      </Space>
      <Table<SystemConfig> rowKey="id" columns={columns} dataSource={configs} loading={loading} scroll={{ x: 1000 }}
        pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }} />

      <Modal title={editing ? "编辑配置" : "新建配置"} open={!!editing || creating}
        onCancel={() => { setEditing(null); setCreating(false); form.resetFields(); }} onOk={save}>
        <Form form={form} layout="vertical" requiredMark={false}>
          {creating && (
            <Form.Item name="key" label="配置键" rules={[{ required: true, message: "请输入配置键" }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="valueJson" label="配置值 (JSON)" rules={[{ required: true, message: "请输入配置值" }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input />
          </Form.Item>
          <Form.Item name="isPublic" label="公开给前端" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ========== Announcements Tab ========== */
function AnnouncementsTab() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { announcements: list, total: t } = await fetchAnnouncements({ page, pageSize: 20 });
      setItems(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (record: Announcement) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      startAt: record.startAt ? dayjs(Number(record.startAt) * 1000) : null,
      endAt: record.endAt ? dayjs(Number(record.endAt) * 1000) : null,
    });
  };

  const save = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      startAt: values.startAt ? String(values.startAt.unix()) : undefined,
      endAt: values.endAt ? String(values.endAt.unix()) : undefined,
    };
    try {
      if (editing) {
        await updateAnnouncement(editing.id, payload);
        message.success("公告已更新");
      } else {
        await createAnnouncement(payload);
        message.success("公告已创建");
      }
      setEditing(null);
      setCreating(false);
      form.resetFields();
      load();
    } catch {
      message.error("保存失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      message.success("公告已删除");
      load();
    } catch {
      message.error("删除失败");
    }
  };

  const columns: ColumnsType<Announcement> = [
    { title: "标题", dataIndex: "title", key: "title", width: 200 },
    { title: "内容", dataIndex: "content", key: "content", ellipsis: true },
    { title: "平台", dataIndex: "targetPlatform", key: "targetPlatform", width: 100, render: (v) => <PlatformTag value={v} /> },
    { title: "状态", dataIndex: "status", key: "status", width: 100, render: (v: number) => <Tag color={v === 1 ? "success" : "default"}>{v === 1 ? "启用" : "停用"}</Tag> },
    { title: "开始", dataIndex: "startAt", key: "startAt", width: 160, render: (v: string) => new Date(Number(v) * 1000).toLocaleString() },
    { title: "结束", dataIndex: "endAt", key: "endAt", width: 160, render: (v: string) => new Date(Number(v) * 1000).toLocaleString() },
    {
      title: "操作", key: "actions", width: 120, fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑"><Button icon={<Pencil size={16} />} onClick={() => openEdit(record)} /></Tooltip>
          <Tooltip title="删除"><Button danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space className="table-toolbar">
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreating(true)}>新建公告</Button>
      </Space>
      <Table<Announcement> rowKey="id" columns={columns} dataSource={items} loading={loading} scroll={{ x: 1100 }}
        pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }} />

      <Modal title={editing ? "编辑公告" : "新建公告"} open={!!editing || creating}
        onCancel={() => { setEditing(null); setCreating(false); form.resetFields(); }} onOk={save} width={560}>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="targetPlatform" label="平台" initialValue="all">
            <Select options={[{ value: "all", label: "全平台" }, { value: "ios", label: "iOS" }, { value: "android", label: "Android" }, { value: "web", label: "Web" }]} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: "启用" }, { value: 0, label: "停用" }]} />
          </Form.Item>
          <Space size={16}>
            <Form.Item name="startAt" label="开始时间"><DatePicker showTime /></Form.Item>
            <Form.Item name="endAt" label="结束时间"><DatePicker showTime /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

/* ========== Versions Tab ========== */
function VersionsTab() {
  const [items, setItems] = useState<AppVersion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AppVersion | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { versions: list, total: t } = await fetchVersions({ page, pageSize: 20 });
      setItems(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (record: AppVersion) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      publishedAt: record.publishedAt ? dayjs(Number(record.publishedAt) * 1000) : null,
    });
  };

  const save = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      publishedAt: values.publishedAt ? String(values.publishedAt.unix()) : undefined,
    };
    try {
      if (editing) {
        await updateVersion(editing.id, payload);
        message.success("版本已更新");
      } else {
        await createVersion(payload);
        message.success("版本已创建");
      }
      setEditing(null);
      setCreating(false);
      form.resetFields();
      load();
    } catch {
      message.error("保存失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVersion(id);
      message.success("版本已删除");
      load();
    } catch {
      message.error("删除失败");
    }
  };

  const columns: ColumnsType<AppVersion> = [
    { title: "平台", dataIndex: "platform", key: "platform", width: 100, render: (v) => <PlatformTag value={v} /> },
    { title: "版本", dataIndex: "version", key: "version", width: 120 },
    { title: "构建号", dataIndex: "buildNo", key: "buildNo", width: 100 },
    { title: "强制更新", dataIndex: "forceUpdate", key: "forceUpdate", width: 120, render: (v) => <Tag color={v ? "error" : "default"}>{v ? "是" : "否"}</Tag> },
    { title: "最低支持", dataIndex: "minSupportedVersion", key: "minSupportedVersion", width: 140 },
    { title: "发布时间", dataIndex: "publishedAt", key: "publishedAt", width: 160, render: (v: string) => new Date(Number(v) * 1000).toLocaleString() },
    {
      title: "操作", key: "actions", width: 120, fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑"><Button icon={<Pencil size={16} />} onClick={() => openEdit(record)} /></Tooltip>
          <Tooltip title="删除"><Button danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space className="table-toolbar">
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreating(true)}>新建版本</Button>
      </Space>
      <Table<AppVersion> rowKey="id" columns={columns} dataSource={items} loading={loading} scroll={{ x: 1000 }}
        pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }} />

      <Modal title={editing ? "编辑版本" : "新建版本"} open={!!editing || creating}
        onCancel={() => { setEditing(null); setCreating(false); form.resetFields(); }} onOk={save}>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="platform" label="平台" rules={[{ required: true }]}>
            <Select options={[{ value: "android", label: "Android" }, { value: "ios", label: "iOS" }, { value: "web", label: "Web" }]} />
          </Form.Item>
          <Form.Item name="version" label="版本号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="buildNo" label="构建号" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="forceUpdate" label="强制更新" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="downloadUrl" label="下载地址"><Input /></Form.Item>
          <Form.Item name="changelog" label="更新说明"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="minSupportedVersion" label="最低支持版本"><Input /></Form.Item>
          <Form.Item name="publishedAt" label="发布时间"><DatePicker showTime /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ========== Main SystemPage ========== */
export function SystemPage() {
  return (
    <div className="page-stack">
      <Card>
        <Tabs items={[
          { key: "configs", label: "系统配置", children: <ConfigsTab /> },
          { key: "announcements", label: "公告", children: <AnnouncementsTab /> },
          { key: "versions", label: "版本", children: <VersionsTab /> },
        ]} />
      </Card>
    </div>
  );
}
