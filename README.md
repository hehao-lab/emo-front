# Emo AI Admin Web

Emo AI 管理后台前端，基于 Vite、React、TypeScript 和 Ant Design。

## 运行

```bash
npm install
npm run dev
```

默认地址：

```text
http://localhost:5173/
```

## 后端接口

开发服务器会把 `/v1` 代理到 Kratos HTTP 服务：

```text
http://localhost:8000
```

也可以在 `.env` 中设置：

```text
VITE_API_BASE_URL=http://localhost:8000
```

当前页面直接调用后端真实接口，不包含 mock 登录或本地预览登录态。后端返回的 `snake_case` 字段会在 API 客户端统一转换为前端使用的 `camelCase`。

管理后台统一调用 `/v1/admin/*` 接口，展示全量用户、日记、会话、情绪、安全审计和文件信息，并支持维护系统配置、公告、版本和系统心情标签。所有后台接口都要求 JWT 包含 `admin` 角色。

App 原有接口仍按当前登录用户隔离数据。后台维护的系统配置、公告、版本和系统心情标签与 App 共用数据表，因此后台发布的运营内容会在 App 中生效，但不会改变 App 的用户数据隔离规则。

## 页面

- 工作台
- 用户管理
- 日记内容
- 情绪分析
- 聊天记录
- 安全审计
- 系统运营
- 心情标签
- 文件资源
