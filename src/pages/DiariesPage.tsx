import { App, Button, Card, Drawer, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, ShieldAlert, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { deleteDiary, fetchDiaries, fetchDiaryDetail } from "../api/diaries";
import type { DiaryRecord } from "../types";

export function DiariesPage() {
  const [diaries, setDiaries] = useState<DiaryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DiaryRecord | null>(null);
  const { message } = App.useApp();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { diaries: list, total: t } = await fetchDiaries({
        page,
        pageSize: 20,
        keyword: keyword || undefined,
      });
      setDiaries(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id: string) => {
    try {
      const detail = await fetchDiaryDetail(id);
      setSelectedDiary(detail);
    } catch {
      message.error("获取日记详情失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDiary(id);
      message.success("日记已删除");
      load();
    } catch {
      message.error("删除失败");
    }
  };

  const columns: ColumnsType<DiaryRecord> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      width: 180,
      render: (value, record) => (
        <div>
          <Typography.Text strong>{value}</Typography.Text>
          <div className="muted-text">{record.username}</div>
        </div>
      ),
    },
    { title: "内容", dataIndex: "content", key: "content", ellipsis: true },
    {
      title: "心情",
      key: "mood",
      width: 120,
      render: (_, record) => `${record.mood} ${record.moodScore}/10`,
    },
    {
      title: "可见性",
      dataIndex: "visibility",
      key: "visibility",
      width: 100,
      render: (v) => <Tag>{v}</Tag>,
    },
    { title: "日期", dataIndex: "occurredOn", key: "occurredOn", width: 120 },
    {
      title: "操作",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="查看">
            <Button icon={<Eye size={16} />} onClick={() => openDetail(record.id)} />
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
            placeholder="搜索标题、内容、用户"
            allowClear
            onSearch={(v) => { setKeyword(v); setPage(1); }}
            onChange={(e) => { if (!e.target.value) { setKeyword(""); setPage(1); } }}
          />
        </Space>
      </Card>

      <Card>
        <Table<DiaryRecord>
          rowKey="id"
          columns={columns}
          dataSource={diaries}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </Card>

      <Drawer title="日记详情" width={560} open={!!selectedDiary} onClose={() => setSelectedDiary(null)}>
        {selectedDiary && (
          <div className="drawer-stack">
            <Space>
              <ShieldAlert size={18} />
            </Space>
            <Typography.Title level={4}>{selectedDiary.title}</Typography.Title>
            <Typography.Paragraph className="detail-content">{selectedDiary.content}</Typography.Paragraph>
            <div className="meta-grid">
              <span>用户</span>
              <strong>{selectedDiary.username}</strong>
              <span>心情</span>
              <strong>{selectedDiary.mood} {selectedDiary.moodScore}/10</strong>
              <span>记录日期</span>
              <strong>{selectedDiary.occurredOn}</strong>
              <span>可见性</span>
              <strong>{selectedDiary.visibility}</strong>
              <span>创建时间</span>
              <strong>{new Date(Number(selectedDiary.createdAt) * 1000).toLocaleString()}</strong>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
