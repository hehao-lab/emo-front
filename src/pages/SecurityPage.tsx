import { Card, Empty, Tabs } from "antd";

export function SecurityPage() {
  return (
    <div className="page-stack">
      <Card>
        <Tabs
          items={[
            {
              key: "events",
              label: "安全事件",
              children: <Empty description="安全事件接口待后端补充" style={{ padding: 80 }} />,
            },
            {
              key: "login",
              label: "登录日志",
              children: <Empty description="登录日志接口待后端补充" style={{ padding: 80 }} />,
            },
            {
              key: "timeline",
              label: "风险时间线",
              children: <Empty description="风险时间线接口待后端补充" style={{ padding: 80 }} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
