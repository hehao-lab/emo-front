import { App, Button, Card, Form, Input, Typography } from "antd";
import { LockKeyhole, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { readToken } from "../api/client";

interface LoginForm {
  phone: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (readToken()) {
      navigate("/", { replace: true });
      return;
    }
    // 检查是否因 session 过期被弹回登录页
    const reason = sessionStorage.getItem("auth:redirect");
    if (reason) {
      sessionStorage.removeItem("auth:redirect");
      message.warning("登录已过期，请重新登录");
    }
  }, [navigate, message]);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values);
      message.success("登录成功");
      navigate("/", { replace: true });
    } catch (err: unknown) {
      console.error("[LoginPage] login error:", err);
      // 优先提取 axios 错误响应中的业务消息
      const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      // 其次使用 Error 的 message
      const errMsg = err instanceof Error ? err.message : "";
      message.error(axiosMsg || errMsg || "登录失败，请检查手机号和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="brand-mark large">E</div>
          <div>
            <Typography.Title level={2}>Emo AI 管理台</Typography.Title>
            <Typography.Text>用户、情绪、内容与运营管理</Typography.Text>
          </div>
        </div>
        <Card className="login-card">
          <Typography.Title level={3}>登录</Typography.Title>
          <Form<LoginForm>
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item name="phone" label="手机号" rules={[{ required: true, message: "请输入手机号" }]}>
              <Input prefix={<Phone size={16} />} size="large" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password
                prefix={<LockKeyhole size={16} />}
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              进入管理台
            </Button>
          </Form>
        </Card>
      </section>
    </main>
  );
}
