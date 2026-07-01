import { App, Button, Card, Form, Input, Modal, Space, Switch, Table, Tabs, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformTag } from "../components/StatusTags";
import {
  announcements as initialAnnouncements,
  configs as initialConfigs,
  versions,
} from "../data/mock";
import type { Announcement, AppVersion, SystemConfig } from "../types";

export function SystemPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>(initialConfigs);
  const [announcements] = useState<Announcement[]>(initialAnnouncements);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [form] = Form.useForm<SystemConfig>();
  const { message } = App.useApp();

  useEffect(() => {
    if (editingConfig) {
      form.setFieldsValue(editingConfig);
    }
  }, [editingConfig, form]);

  const configColumns: ColumnsType<SystemConfig> = [
    { title: "配置键", dataIndex: "key", key: "key", width: 240 },
    { title: "配置值", dataIndex: "value", key: "value", ellipsis: true },
    { title: "说明", dataIndex: "description", key: "description", width: 220 },
    {
      title: "公开",
      dataIndex: "isPublic",
      key: "isPublic",
      width: 90,
      render: (value) => <Tag color={value ? "success" : "default"}>{value ? "是" : "否"}</Tag>,
    },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 160 },
    {
      title: "操作",
      key: "actions",
      width: 88,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="编辑">
          <Button icon={<Pencil size={16} />} onClick={() => setEditingConfig(record)} />
        </Tooltip>
      ),
    },
  ];

  const announcementColumns: ColumnsType<Announcement> = [
    { title: "标题", dataIndex: "title", key: "title", width: 200 },
    { title: "内容", dataIndex: "content", key: "content", ellipsis: true },
    {
      title: "平台",
      dataIndex: "platform",
      key: "platform",
      width: 100,
      render: (value) => <PlatformTag value={value} />,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value) => <Tag color={value === "enabled" ? "success" : "default"}>{value === "enabled" ? "启用" : "停用"}</Tag>,
    },
    { title: "开始", dataIndex: "startAt", key: "startAt", width: 160 },
    { title: "结束", dataIndex: "endAt", key: "endAt", width: 160 },
  ];

  const versionColumns: ColumnsType<AppVersion> = [
    {
      title: "平台",
      dataIndex: "platform",
      key: "platform",
      width: 100,
      render: (value) => <PlatformTag value={value} />,
    },
    { title: "版本", dataIndex: "version", key: "version", width: 120 },
    { title: "构建号", dataIndex: "buildNo", key: "buildNo", width: 100 },
    {
      title: "强制更新",
      dataIndex: "forceUpdate",
      key: "forceUpdate",
      width: 120,
      render: (value) => <Tag color={value ? "error" : "default"}>{value ? "是" : "否"}</Tag>,
    },
    { title: "最低支持", dataIndex: "minSupportedVersion", key: "minSupportedVersion", width: 140 },
    { title: "发布时间", dataIndex: "publishedAt", key: "publishedAt", width: 160 },
  ];

  const saveConfig = async () => {
    const values = await form.validateFields();
    setConfigs((items) =>
      items.map((item) => (item.id === editingConfig?.id ? { ...item, ...values, updatedAt: "2026-06-30 12:00" } : item)),
    );
    setEditingConfig(null);
    message.success("配置已保存");
  };

  return (
    <div className="page-stack">
      <Card>
        <Tabs
          items={[
            {
              key: "configs",
              label: "系统配置",
              children: (
                <Table<SystemConfig>
                  rowKey="id"
                  columns={configColumns}
                  dataSource={configs}
                  scroll={{ x: 980 }}
                  pagination={false}
                />
              ),
            },
            {
              key: "announcements",
              label: "公告",
              children: (
                <div className="tab-stack">
                  <Space className="table-toolbar">
                    <Button type="primary" icon={<Plus size={16} />}>
                      新建公告
                    </Button>
                  </Space>
                  <Table<Announcement>
                    rowKey="id"
                    columns={announcementColumns}
                    dataSource={announcements}
                    scroll={{ x: 1000 }}
                    pagination={false}
                  />
                </div>
              ),
            },
            {
              key: "versions",
              label: "版本",
              children: (
                <Table<AppVersion>
                  rowKey="id"
                  columns={versionColumns}
                  dataSource={versions}
                  scroll={{ x: 840 }}
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal title="编辑配置" open={Boolean(editingConfig)} onCancel={() => setEditingConfig(null)} onOk={saveConfig}>
        <Form<SystemConfig> form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="key" label="配置键" rules={[{ required: true, message: "请输入配置键" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label="配置值" rules={[{ required: true, message: "请输入配置值" }]}>
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
