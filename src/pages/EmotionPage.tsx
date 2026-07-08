import { Button, Card, Col, Descriptions, Drawer, Row, Select, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, Siren } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from "recharts";
import { fetchAnalyses, fetchAnalysisDetail } from "../api/emotion";
import { RiskTag } from "../components/StatusTags";
import type { EmotionAnalysis, RiskLevel } from "../types";

const columns: ColumnsType<EmotionAnalysis> = [
  { title: "用户", dataIndex: "username", key: "username", width: 120 },
  { title: "来源", dataIndex: "sourceType", key: "sourceType", width: 130 },
  { title: "主情绪", dataIndex: "primaryEmotion", key: "primaryEmotion", width: 110 },
  {
    title: "压力 / 焦虑 / 抑郁",
    key: "scores",
    width: 170,
    render: (_, record) => `${record.stressScore} / ${record.anxietyScore} / ${record.depressionRiskScore}`,
  },
  { title: "风险", dataIndex: "riskLevel", key: "riskLevel", width: 100, render: (v) => <RiskTag value={v} /> },
  { title: "摘要", dataIndex: "summary", key: "summary", ellipsis: true },
  { title: "时间", dataIndex: "createdAt", key: "createdAt", width: 160, render: (v: string) => new Date(Number(v) * 1000).toLocaleString() },
];

const riskRadar = [
  { dimension: "压力", key: "stressScore" },
  { dimension: "焦虑", key: "anxietyScore" },
  { dimension: "抑郁风险", key: "depressionRiskScore" },
  { dimension: "能量", key: "energyScore" },
  { dimension: "消极倾向", key: "sentimentScore" },
];

export function EmotionPage() {
  const [analyses, setAnalyses] = useState<EmotionAnalysis[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<EmotionAnalysis | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { analyses: list, total: t } = await fetchAnalyses({
        page,
        pageSize: 20,
        riskLevel: riskFilter === "all" ? undefined : riskFilter,
      });
      setAnalyses(list);
      setTotal(Number(t));
    } finally {
      setLoading(false);
    }
  }, [page, riskFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id: string) => {
    try {
      const detail = await fetchAnalysisDetail(id);
      setSelected(detail);
    } catch {
      // fallback to list data
      const item = analyses.find((a) => a.id === id);
      if (item) setSelected(item);
    }
  };

  const radarData = selected
    ? riskRadar.map((r) => ({
        dimension: r.dimension,
        score: (selected as unknown as Record<string, number>)[r.key] || 0,
      }))
    : [];

  return (
    <div className="page-stack">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card title={<Space><Siren size={18} />风险维度</Space>} className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData.length ? radarData : riskRadar.map((r) => ({ dimension: r.dimension, score: 50 }))}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <ChartTooltip />
                <Radar name="分数" dataKey="score" stroke="#dc2626" fill="#dc2626" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={15}>
          <Card title="分析记录" extra={
            <Select
              value={riskFilter}
              onChange={(v) => { setRiskFilter(v); setPage(1); }}
              style={{ width: 120 }}
              options={[
                { value: "all", label: "全部风险" },
                { value: "low", label: "低风险" },
                { value: "medium", label: "中风险" },
                { value: "high", label: "高风险" },
                { value: "crisis", label: "危机" },
              ]}
            />
          }>
            <Table<EmotionAnalysis>
              rowKey="id"
              columns={[...columns, {
                title: "操作", key: "actions", width: 88, fixed: "right",
                render: (_, record) => (
                  <Tooltip title="查看">
                    <Button icon={<Eye size={16} />} onClick={() => openDetail(record.id)} />
                  </Tooltip>
                ),
              }]}
              dataSource={analyses}
              loading={loading}
              scroll={{ x: 1120 }}
              pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }}
            />
          </Card>
        </Col>
      </Row>

      <Drawer title="分析详情" width={560} open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="drawer-stack">
            <Space>
              <RiskTag value={selected.riskLevel} />
              <Typography.Text type="secondary">置信度 {Math.round(selected.confidence * 100)}%</Typography.Text>
            </Space>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="用户">{selected.username}</Descriptions.Item>
              <Descriptions.Item label="来源">{selected.sourceType}</Descriptions.Item>
              <Descriptions.Item label="主情绪">{selected.primaryEmotion}</Descriptions.Item>
              <Descriptions.Item label="情感倾向">{selected.sentiment}</Descriptions.Item>
              <Descriptions.Item label="情感分">{selected.sentimentScore}</Descriptions.Item>
              <Descriptions.Item label="压力">{selected.stressScore}</Descriptions.Item>
              <Descriptions.Item label="焦虑">{selected.anxietyScore}</Descriptions.Item>
              <Descriptions.Item label="抑郁风险">{selected.depressionRiskScore}</Descriptions.Item>
              <Descriptions.Item label="能量">{selected.energyScore}</Descriptions.Item>
              <Descriptions.Item label="模型">{selected.model}</Descriptions.Item>
            </Descriptions>
            <div>
              <Typography.Title level={5}>摘要</Typography.Title>
              <Typography.Paragraph>{selected.summary}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Title level={5}>建议</Typography.Title>
              <Typography.Paragraph>{selected.advice}</Typography.Paragraph>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
