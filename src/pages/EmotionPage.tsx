import { Button, Card, Col, Descriptions, Drawer, Row, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, Siren } from "lucide-react";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from "recharts";
import { RiskTag } from "../components/StatusTags";
import { analyses, riskRadar } from "../data/mock";
import type { EmotionAnalysis } from "../types";

const columns: ColumnsType<EmotionAnalysis> = [
  {
    title: "用户",
    dataIndex: "username",
    key: "username",
    width: 120,
  },
  {
    title: "来源",
    dataIndex: "sourceType",
    key: "sourceType",
    width: 130,
  },
  {
    title: "主情绪",
    dataIndex: "primaryEmotion",
    key: "primaryEmotion",
    width: 110,
  },
  {
    title: "情感分",
    dataIndex: "sentimentScore",
    key: "sentimentScore",
    width: 110,
  },
  {
    title: "压力 / 焦虑 / 抑郁",
    key: "scores",
    width: 170,
    render: (_, record) => `${record.stressScore} / ${record.anxietyScore} / ${record.depressionRiskScore}`,
  },
  {
    title: "风险",
    dataIndex: "riskLevel",
    key: "riskLevel",
    width: 100,
    render: (value) => <RiskTag value={value} />,
  },
  {
    title: "摘要",
    dataIndex: "summary",
    key: "summary",
    ellipsis: true,
  },
  {
    title: "时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 160,
  },
];

export function EmotionPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<EmotionAnalysis | null>(null);

  return (
    <div className="page-stack">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card
            title={
              <Space>
                <Siren size={18} />
                风险维度
              </Space>
            }
            className="chart-card"
          >
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={riskRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <ChartTooltip />
                <Radar name="分数" dataKey="score" stroke="#dc2626" fill="#dc2626" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={15}>
          <Card title="分析记录">
            <Table<EmotionAnalysis>
              rowKey="id"
              columns={[
                ...columns,
                {
                  title: "操作",
                  key: "actions",
                  width: 88,
                  fixed: "right",
                  render: (_, record) => (
                    <Tooltip title="查看">
                      <Button icon={<Eye size={16} />} onClick={() => setSelectedAnalysis(record)} />
                    </Tooltip>
                  ),
                },
              ]}
              dataSource={analyses}
              scroll={{ x: 1120 }}
              pagination={{ pageSize: 6, showSizeChanger: false }}
            />
          </Card>
        </Col>
      </Row>

      <Drawer
        title="分析详情"
        width={560}
        open={Boolean(selectedAnalysis)}
        onClose={() => setSelectedAnalysis(null)}
      >
        {selectedAnalysis && (
          <div className="drawer-stack">
            <Space>
              <RiskTag value={selectedAnalysis.riskLevel} />
              <Typography.Text type="secondary">置信度 {Math.round(selectedAnalysis.confidence * 100)}%</Typography.Text>
            </Space>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="用户">{selectedAnalysis.username}</Descriptions.Item>
              <Descriptions.Item label="来源">{selectedAnalysis.sourceType}</Descriptions.Item>
              <Descriptions.Item label="主情绪">{selectedAnalysis.primaryEmotion}</Descriptions.Item>
              <Descriptions.Item label="情感倾向">{selectedAnalysis.sentiment}</Descriptions.Item>
              <Descriptions.Item label="情感分">{selectedAnalysis.sentimentScore}</Descriptions.Item>
              <Descriptions.Item label="压力">{selectedAnalysis.stressScore}</Descriptions.Item>
              <Descriptions.Item label="焦虑">{selectedAnalysis.anxietyScore}</Descriptions.Item>
              <Descriptions.Item label="抑郁风险">{selectedAnalysis.depressionRiskScore}</Descriptions.Item>
              <Descriptions.Item label="能量">{selectedAnalysis.energyScore}</Descriptions.Item>
            </Descriptions>
            <div>
              <Typography.Title level={5}>摘要</Typography.Title>
              <Typography.Paragraph>{selectedAnalysis.summary}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Title level={5}>建议</Typography.Title>
              <Typography.Paragraph>{selectedAnalysis.advice}</Typography.Paragraph>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
