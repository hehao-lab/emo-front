import { Card, Col, Empty, Row, Space, Spin, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarHeart,
  FileArchive,
  MessageCircle,
  MessageSquareText,
  NotebookTabs,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchOverview, fetchTrends } from "../api/dashboard";
import { fetchAnalyses } from "../api/emotion";
import { RiskTag } from "../components/StatusTags";
import { StatCard } from "../components/StatCard";
import type { DashboardOverview, EmotionAnalysis, TrendPoint } from "../types";

const modules: Array<{
  title: string;
  path: string;
  desc: string;
  icon: ReactNode;
  tone: string;
}> = [
  { title: "用户管理", path: "/users", desc: "账号、状态、风险画像", icon: <UsersRound size={24} />, tone: "blue" },
  { title: "日记内容", path: "/diaries", desc: "用户日记与内容审核", icon: <CalendarHeart size={24} />, tone: "green" },
  { title: "情绪分析", path: "/emotion", desc: "分析记录与风险判断", icon: <Bot size={24} />, tone: "red" },
  { title: "聊天记录", path: "/chat", desc: "AI 会话与消息链路", icon: <MessageSquareText size={24} />, tone: "orange" },
  { title: "安全审计", path: "/security", desc: "登录日志与安全事件", icon: <ShieldCheck size={24} />, tone: "blue" },
  { title: "系统运营", path: "/system", desc: "公告、版本、系统配置", icon: <Settings size={24} />, tone: "green" },
  { title: "文件资源", path: "/files", desc: "上传资源与文件状态", icon: <FileArchive size={24} />, tone: "orange" },
];

function formatTrends(points: TrendPoint[]) {
  return points.map((p) => ({
    date: p.date.slice(5),
    users: Number(p.newUsers),
    diaries: Number(p.diaries),
    analyses: Number(p.emotionAnalyses),
    highRisk: 0,
  }));
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [trends, setTrends] = useState<ReturnType<typeof formatTrends>>([]);
  const [analyses, setAnalyses] = useState<EmotionAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, tr, an] = await Promise.all([
          fetchOverview(),
          fetchTrends("2026-06-25", "2026-07-03"),
          fetchAnalyses({ pageSize: 10 }),
        ]);
        setOverview(ov);
        setTrends(formatTrends(tr.points));
        setAnalyses(an.analyses);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const riskColumns: ColumnsType<EmotionAnalysis> = [
    { title: "用户", dataIndex: "username", key: "username", width: 120 },
    { title: "风险", dataIndex: "riskLevel", key: "riskLevel", width: 100, render: (v) => <RiskTag value={v} /> },
    { title: "主情绪", dataIndex: "primaryEmotion", key: "primaryEmotion", width: 120 },
    { title: "摘要", dataIndex: "summary", key: "summary", ellipsis: true },
    { title: "时间", dataIndex: "createdAt", key: "createdAt", width: 160 },
  ];

  return (
    <div className="page-stack">
      <Card title="管理模块入口">
        <Row gutter={[14, 14]}>
          {modules.map((item) => (
            <Col xs={24} sm={12} lg={8} xxl={6} key={item.path}>
              <button className={`module-card module-card-${item.tone}`} onClick={() => navigate(item.path)}>
                <span className="module-icon">{item.icon}</span>
                <span>
                  <strong>{item.title}</strong>
                  <em>{item.desc}</em>
                </span>
              </button>
            </Col>
          ))}
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <StatCard title="注册用户" value={overview?.userCount || "0"} note={`+${overview?.todayNewUsers || "0"} 今日新增`} icon={<UsersRound size={22} />} tone="blue" />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard title="日记记录" value={overview?.diaryCount || "0"} note={`${overview?.todayDiaries || "0"} 今日`} icon={<NotebookTabs size={22} />} tone="green" />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard title="AI 会话" value={overview?.chatSessionCount || "0"} note={`${overview?.todayChatMessages || "0"} 条今日消息`} icon={<MessageCircle size={22} />} tone="orange" />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard title="高风险提醒" value={overview?.highRiskAnalysisCount || "0"} note={`${overview?.emotionAnalysisCount || "0"} 次分析`} icon={<AlertTriangle size={22} />} tone="red" />
          </Col>
        </Row>
      </Spin>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title="近 7 日业务趋势" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="trendUsers" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="trendAnalyses" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" name="新用户" stroke="#2563eb" fill="url(#trendUsers)" />
                <Area type="monotone" dataKey="analyses" name="情绪分析" stroke="#0f766e" fill="url(#trendAnalyses)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title={<Space><Activity size={18} />情绪分布</Space>} className="chart-card">
            <Empty description="待后端提供情绪分布接口" style={{ padding: 60 }} />
          </Card>
        </Col>
      </Row>

      <Card title={<Space><AlertTriangle size={18} />风险队列</Space>} extra={<Typography.Text type="secondary">按风险等级与时间排序</Typography.Text>}>
        <Table<EmotionAnalysis> rowKey="id" columns={riskColumns} dataSource={analyses} pagination={false} scroll={{ x: 760 }} />
      </Card>
    </div>
  );
}
