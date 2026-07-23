import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Layout,
  Menu,
  Space,
  theme,
  Tooltip,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  Bell,
  Bot,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  FileArchive,
  Gauge,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  UserRoundCog,
} from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { clearSession, readProfile, readRefreshToken } from "../api/client";
import type { AdminProfile } from "../api/auth";

const { Header, Sider, Content } = Layout;

const navLinks = [
  { key: "/", label: "工作台" },
  { key: "/users", label: "用户管理" },
  { key: "/diaries", label: "日记内容" },
  { key: "/emotion", label: "情绪分析" },
  { key: "/chat", label: "聊天记录" },
  { key: "/security", label: "安全审计" },
  { key: "/system", label: "系统运营" },
  { key: "/mood-tags", label: "心情标签" },
  { key: "/files", label: "文件资源" },
];

const navItems: MenuProps["items"] = [
  { key: "/", icon: <Gauge size={18} />, label: "工作台" },
  { key: "/users", icon: <UserRoundCog size={18} />, label: "用户管理" },
  { key: "/diaries", icon: <CalendarHeart size={18} />, label: "日记内容" },
  { key: "/emotion", icon: <Bot size={18} />, label: "情绪分析" },
  { key: "/chat", icon: <MessageSquareText size={18} />, label: "聊天记录" },
  { key: "/security", icon: <ShieldCheck size={18} />, label: "安全审计" },
  { key: "/system", icon: <Settings size={18} />, label: "系统运营" },
  { key: "/mood-tags", icon: <Tags size={18} />, label: "心情标签" },
  { key: "/files", icon: <FileArchive size={18} />, label: "文件资源" },
];

const titleMap: Record<string, string> = {
  "/": "工作台",
  "/users": "用户管理",
  "/diaries": "日记内容",
  "/emotion": "情绪分析",
  "/chat": "聊天记录",
  "/security": "安全审计",
  "/system": "系统运营",
  "/mood-tags": "心情标签",
  "/files": "文件资源",
};

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = readProfile<AdminProfile>();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const selectedKey = titleMap[location.pathname] ? location.pathname : "/";

  return (
    <Layout className="admin-shell">
      <Sider
        className="admin-sider"
        width={248}
        breakpoint="lg"
        collapsedWidth={72}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
      >
        <div className="sider-inner">
          <div className="brand-block">
            <div className="brand-mark">E</div>
            {!collapsed && (
              <div>
                <Typography.Title level={4}>Emo AI</Typography.Title>
                <Typography.Text>Admin</Typography.Text>
              </div>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={navItems}
            onClick={({ key }) => navigate(key)}
          />
          <div className="sider-trigger">
            <CollapseTrigger collapsed={collapsed} onClick={() => setCollapsed((value) => !value)} />
          </div>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer }} className="admin-header">
          <div className="header-left">
            <Typography.Title level={3}>{titleMap[selectedKey]}</Typography.Title>
            <div className="header-nav">
              {navLinks.map((item) => (
                <Button
                  key={item.key}
                  type={selectedKey === item.key ? "primary" : "default"}
                  onClick={() => navigate(item.key)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          <Space className="header-actions" size={12}>
            <Input
              className="global-search"
              prefix={<Search size={16} />}
              placeholder="搜索用户、日记、会话"
              allowClear
            />
            <Tooltip title="风险提醒">
              <Badge count={0} size="small">
                <Button icon={<Bell size={18} />} />
              </Badge>
            </Tooltip>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogOut size={16} />,
                    label: "退出登录",
                    onClick: async () => {
                      const refreshToken = readRefreshToken();
                      try {
                        if (refreshToken) await logout(refreshToken);
                      } finally {
                        clearSession();
                        navigate("/login", { replace: true });
                      }
                    },
                  },
                ],
              }}
            >
              <Button className="profile-button">
                <Avatar size={26} src={profile?.avatar}>
                  {profile?.username?.slice(0, 1).toUpperCase()}
                </Avatar>
                <span>{profile?.username || "admin"}</span>
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export function CollapseTrigger({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="text"
      icon={collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      onClick={onClick}
    />
  );
}
