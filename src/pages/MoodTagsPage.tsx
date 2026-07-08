import { App, Button, Card, ColorPicker, Form, Input, InputNumber, Modal, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createMoodTag, deleteMoodTag, fetchMoodTags, updateMoodTag } from "../api/mood-tags";
import type { MoodTag } from "../types";

export function MoodTagsPage() {
  const [tags, setTags] = useState<MoodTag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<MoodTag | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { tags: list, total: t } = await fetchMoodTags({
        page,
        pageSize: 20,
        keyword: keyword || undefined,
      });
      setTags(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (record: MoodTag) => {
    setEditing(record);
    form.setFieldsValue(record);
  };

  const save = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateMoodTag(editing.id, values);
        message.success("标签已更新");
      } else {
        await createMoodTag(values);
        message.success("标签已创建");
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
      await deleteMoodTag(id);
      message.success("标签已删除");
      load();
    } catch {
      message.error("删除失败");
    }
  };

  const columns: ColumnsType<MoodTag> = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 160,
      render: (name: string, record) => (
        <Space>
          <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 4, background: record.color }} />
          <strong>{name}</strong>
        </Space>
      ),
    },
    { title: "颜色", dataIndex: "color", key: "color", width: 120, render: (v) => <Tag color={v}>{v}</Tag> },
    { title: "图标", dataIndex: "icon", key: "icon", width: 120 },
    { title: "排序", dataIndex: "sort", key: "sort", width: 80 },
    {
      title: "类型",
      dataIndex: "system",
      key: "system",
      width: 100,
      render: (v: boolean) => <Tag color={v ? "processing" : "default"}>{v ? "系统" : "自定义"}</Tag>,
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
      render: (v: string) => new Date(Number(v) * 1000).toLocaleString(),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button icon={<Pencil size={16} />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <Card>
        <Space className="table-toolbar" size={12}>
          <Input.Search
            placeholder="搜索标签名称"
            allowClear
            onSearch={(v) => { setKeyword(v); setPage(1); }}
            onChange={(e) => { if (!e.target.value) { setKeyword(""); setPage(1); } }}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreating(true)}>
            新建标签
          </Button>
        </Space>
      </Card>

      <Card>
        <Table<MoodTag>
          rowKey="id"
          columns={columns}
          dataSource={tags}
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
        title={editing ? "编辑标签" : "新建标签"}
        open={!!editing || creating}
        onCancel={() => {
          setEditing(null);
          setCreating(false);
          form.resetFields();
        }}
        onOk={save}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入标签名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="颜色" rules={[{ required: true, message: "请选择颜色" }]}>
            <ColorPicker showText />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="smile / heart / star 等" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={10}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
