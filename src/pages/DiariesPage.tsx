import { Button, Card, Drawer, Input, Select, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { RiskTag } from "../components/StatusTags";
import { diaries } from "../data/mock";
import type { DiaryRecord, RiskLevel } from "../types";

export function DiariesPage() {
  const [keyword, setKeyword] = useState("");
  const [risk, setRisk] = useState<RiskLevel | "all">("all");
  const [selectedDiary, setSelectedDiary] = useState<DiaryRecord | null>(null);

  const filteredDiaries = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return diaries.filter((diary) => {
      const matchesKeyword =
        !value ||
        diary.title.toLowerCase().includes(value) ||
        diary.content.toLowerCase().includes(value) ||
        diary.username.toLowerCase().includes(value);
      const matchesRisk = risk === "all" || diary.riskLevel === risk;
      return matchesKeyword && matchesRisk;
    });
  }, [keyword, risk]);

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
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "心情",
      key: "mood",
      width: 120,
      render: (_, record) => `${record.mood} ${record.moodScore}/10`,
    },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      width: 220,
      render: (tags: string[]) => tags.map((tag) => <Tag key={tag}>{tag}</Tag>),
    },
    {
      title: "风险",
      dataIndex: "riskLevel",
      key: "riskLevel",
      width: 100,
      render: (value) => <RiskTag value={value} />,
    },
    {
      title: "日期",
      dataIndex: "occurredOn",
      key: "occurredOn",
      width: 120,
    },
    {
      title: "操作",
      key: "actions",
      width: 88,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="查看">
          <Button icon={<Eye size={16} />} onClick={() => setSelectedDiary(record)} />
        </Tooltip>
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
            onSearch={setKeyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            value={risk}
            onChange={setRisk}
            options={[
              { value: "all", label: "全部风险" },
              { value: "low", label: "低风险" },
              { value: "medium", label: "中风险" },
              { value: "high", label: "高风险" },
              { value: "crisis", label: "危机" },
            ]}
          />
        </Space>
      </Card>

      <Card>
        <Table<DiaryRecord>
          rowKey="id"
          columns={columns}
          dataSource={filteredDiaries}
          scroll={{ x: 980 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>

      <Drawer
        title="日记详情"
        width={560}
        open={Boolean(selectedDiary)}
        onClose={() => setSelectedDiary(null)}
      >
        {selectedDiary && (
          <div className="drawer-stack">
            <Space>
              <ShieldAlert size={18} />
              <RiskTag value={selectedDiary.riskLevel} />
            </Space>
            <Typography.Title level={4}>{selectedDiary.title}</Typography.Title>
            <Typography.Paragraph className="detail-content">{selectedDiary.content}</Typography.Paragraph>
            <Space wrap>
              {selectedDiary.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
            <div className="meta-grid">
              <span>用户</span>
              <strong>{selectedDiary.username}</strong>
              <span>心情</span>
              <strong>
                {selectedDiary.mood} {selectedDiary.moodScore}/10
              </strong>
              <span>记录日期</span>
              <strong>{selectedDiary.occurredOn}</strong>
              <span>可见性</span>
              <strong>{selectedDiary.visibility}</strong>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
