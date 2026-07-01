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

当前页面使用 mock 数据完成管理界面闭环。登录会优先请求 `/v1/users/login`，如果本地后端未启动，会使用本地预览登录态进入后台。

## 页面

- 工作台
- 用户管理
- 日记内容
- 情绪分析
- 聊天记录
- 安全审计
- 系统运营
- 文件资源
