import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Segmented,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createConfig,
  createVersion,
  deleteConfig,
  fetchConfigs,
  fetchLatestVersion,
  fetchPublicConfigs,
  fetchVersions,
  updateConfig,
  updateVersion,
} from "../api/system";
import type { AppVersion, SystemConfig } from "../types";

type ContentMode = "privacy" | "about";

interface AboutFormValues {
  appName: string;
  company: string;
  description: string;
  privacyUrl?: string;
  termsUrl?: string;
  contactEmail?: string;
  website?: string;
  version: string;
  buildNo: number;
  changelog?: string;
}

interface PrivacySection {
  id?: string;
  title: string;
  body: string;
}

interface PrivacyFormValues {
  eyebrow: string;
  title: string;
  summary: string;
  sections: PrivacySection[];
}

const PRIVACY_CONFIG_KEY = "privacy.page";
const URL_RULE = { pattern: /^(https?:\/\/|\/)/i, message: "请输入 http(s) 地址或以 / 开头的 App 路径" };

const ABOUT_CONFIG_FIELDS: Array<{
  field: keyof AboutFormValues;
  key: string;
  description: string;
}> = [
  { field: "appName", key: "about.app_name", description: "关于我们：应用名称" },
  { field: "company", key: "about.company", description: "关于我们：团队名称" },
  { field: "description", key: "about.description", description: "关于我们：应用简介" },
  { field: "privacyUrl", key: "about.privacy_url", description: "关于我们：隐私政策地址" },
  { field: "termsUrl", key: "about.terms_url", description: "关于我们：用户协议地址" },
  { field: "contactEmail", key: "about.contact_email", description: "关于我们：联系邮箱" },
  { field: "website", key: "about.website", description: "关于我们：官网地址" },
];

const DEFAULT_PRIVACY_CONTENT: PrivacyFormValues = {
  eyebrow: "隐私与安全",
  title: "隐私与安全说明",
  summary: "我们按照合法、正当、必要、诚信的原则处理你的个人信息，并以公开透明、最小必要的方式说明数据使用与保护策略。",
  sections: [
    { title: "账号安全", body: "修改登录方式、查看设备状态和安全提醒。" },
    { title: "数据管理", body: "查看数据保存与清理相关设置。" },
    {
      title: "我们收集与使用的信息",
      body: "为了实现登录识别、咨询记录保存、情绪记录管理、重要事件整理以及情感分析等基本功能，我们可能会收集账号标识信息、对话内容、日记内容、重要记录以及为维护服务正常运行所必需的基础设备信息。我们只会在与功能和服务相关的范围内使用这些信息，不会为无关目的超范围收集。",
    },
    {
      title: "权限申请与敏感信息说明",
      body: "我们仅在具体业务场景下按需申请系统权限，并在你授权后在必要范围内使用。如果某项权限或信息属于敏感个人信息或可能对你的权益产生较大影响，我们将在启用前另行告知目的、必要性和影响，并得到你的同意。不同意非必要权限，不会影响基本功能的使用。",
    },
    {
      title: "存储期限与安全保护",
      body: "我们遵循最小必要原则确定信息存储期限，在达到服务目的或法律法规要求后，会对相关信息进行删除或匿名化处理。同时，我们会通过访问控制、最小授权、传输保护、日志稽核等措施尽力防止未经授权的访问、泄露、篡改或丢失。",
    },
    {
      title: "对外共享、转让与公开说明",
      body: "未经你同意，我们不会向无关的第三方提供你的个人信息。如因业务需要接入第三方服务或软件工具，我们会在隐私政策或其他合适的告知方式中说明其处理目的、数据类型及使用边界。只有在法律法规要求、保护你或公共人身财产安全等法定情形下，我们才会依法进行转让、共享或公开。",
    },
    {
      title: "你依法享有的权利",
      body: "你有权查看、更正、补充、删除你的个人信息，也有权撤回授权、反对或限制特定处理，并可以申请注销账号。如你对个人信息处理事项存在疑问，可通过隐私政策、反馈渠道或客服方式向我们进行询问、投诉或举报。",
    },
    {
      title: "未成年人保护与联系我们",
      body: "如果涉及未成年人个人信息，我们将依法在监护人同意或法律允许的范围内进行处理，并采取更严格的保护措施。如你希望查看完整隐私政策、申请删除数据、注销账号或反馈隐私与安全问题，可通过页面指引或客服支持渠道联系我们处理。",
    },
  ],
};

const DEFAULT_ABOUT_CONTENT: AboutFormValues = {
  appName: "Emo AI",
  company: "Emo AI Team",
  description: "情感 AI 聊天助手后端服务",
  privacyUrl: "/privacy",
  termsUrl: "/terms",
  contactEmail: "support@example.com",
  website: "https://example.com",
  version: "",
  buildNo: 1,
  changelog: "",
};

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toRowMap(rows: SystemConfig[]) {
  return Object.fromEntries(rows.map((row) => [row.key, row])) as Record<string, SystemConfig>;
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const responseData = (error as {
      response?: { data?: { message?: unknown; reason?: unknown } };
    }).response?.data;
    const detail = responseData?.message || responseData?.reason;
    if (typeof detail === "string" && detail.trim()) {
      return `${fallback}：${detail}`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function AppContentManager() {
  const [mode, setMode] = useState<ContentMode>("privacy");
  const [rows, setRows] = useState<Record<string, SystemConfig>>({});
  const [latestAndroidVersion, setLatestAndroidVersion] = useState<AppVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<ContentMode | null>(null);
  const [privacyForm] = Form.useForm<PrivacyFormValues>();
  const [aboutForm] = Form.useForm<AboutFormValues>();
  const { message } = App.useApp();

  const load = async () => {
    setLoading(true);
    try {
      const [{ configs }, { versions }] = await Promise.all([
        fetchConfigs({ page: 1, pageSize: 100 }),
        fetchVersions({ page: 1, pageSize: 100, platform: "android" }),
      ]);
      const nextRows = toRowMap(configs);
      const privacy = parseJSON<PrivacyFormValues>(nextRows[PRIVACY_CONFIG_KEY]?.valueJson, DEFAULT_PRIVACY_CONTENT);
      const latestVersion = [...versions].sort((left, right) => right.buildNo - left.buildNo)[0] || null;

      setRows(nextRows);
      setLatestAndroidVersion(latestVersion);
      privacyForm.setFieldsValue({
        ...DEFAULT_PRIVACY_CONTENT,
        ...privacy,
        sections: Array.isArray(privacy.sections) ? privacy.sections : [],
      });
      const aboutValues = Object.fromEntries(
        ABOUT_CONFIG_FIELDS.map(({ field, key }) => [
          field,
          parseJSON(nextRows[key]?.valueJson, DEFAULT_ABOUT_CONTENT[field] || ""),
        ]),
      ) as Partial<AboutFormValues>;
      aboutForm.setFieldsValue({
        ...aboutValues,
        version: latestVersion?.version || "",
        buildNo: latestVersion?.buildNo || 1,
        changelog: latestVersion?.changelog || "",
      });
    } catch (error) {
      message.error({
        content: getRequestErrorMessage(error, "App 页面内容加载失败"),
        key: "app-content-load-error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upsert = async (key: string, value: unknown, description: string) => {
    const body = { valueJson: JSON.stringify(value), description, isPublic: true };
    const existing = rows[key];
    if (existing) {
      await updateConfig(existing.id, body);
    } else {
      await createConfig({ key, ...body });
    }
  };

  const savePrivacy = async () => {
    const values = await privacyForm.validateFields();
    const content: PrivacyFormValues = {
      ...values,
      eyebrow: values.eyebrow.trim(),
      title: values.title.trim(),
      summary: values.summary.trim(),
      sections: values.sections.map((section, index) => ({
        id: section.id || `privacy-${Date.now()}-${index}`,
        title: section.title.trim(),
        body: section.body.trim(),
      })),
    };
    setSaving("privacy");
    try {
      await upsert(PRIVACY_CONFIG_KEY, content, "App 隐私与安全页面内容");

      const publicRow = (await fetchPublicConfigs()).find((item) => item.key === PRIVACY_CONFIG_KEY);
      if (!publicRow) {
        throw new Error("后端已响应保存，但公开接口没有返回 privacy.page，请检查公开标记");
      }
      const published = parseJSON<PrivacyFormValues | null>(publicRow.valueJson, null);
      if (!published || published.summary !== content.summary) {
        throw new Error("公开接口返回的摘要与刚保存的内容不一致");
      }

      message.success("隐私与安全内容已发布");
      await load();
    } catch (error) {
      message.error(getRequestErrorMessage(error, "隐私与安全内容保存失败"));
    } finally {
      setSaving(null);
    }
  };

  const deletePrivacy = async () => {
    const existing = rows[PRIVACY_CONFIG_KEY];
    if (!existing) return;
    try {
      await deleteConfig(existing.id);
      message.success("已恢复 App 内置隐私内容");
      await load();
    } catch (error) {
      message.error(getRequestErrorMessage(error, "删除失败"));
    }
  };

  const saveAbout = async () => {
    const values = await aboutForm.validateFields();
    const version = values.version.trim();
    const buildNo = Number(values.buildNo);
    const versionPayload: Partial<AppVersion> = {
      platform: "android",
      version,
      buildNo,
      forceUpdate: latestAndroidVersion?.forceUpdate || false,
      downloadUrl: latestAndroidVersion?.downloadUrl || "",
      changelog: String(values.changelog || "").trim(),
      minSupportedVersion: latestAndroidVersion?.minSupportedVersion || "",
      publishedAt: latestAndroidVersion?.publishedAt || String(Math.floor(Date.now() / 1000)),
    };
    setSaving("about");
    try {
      await Promise.all([
        ...ABOUT_CONFIG_FIELDS.map(async ({ field, key, description }) => {
          const value = String(values[field] || "").trim();
          if (value) {
            await upsert(key, value, description);
          } else if (rows[key]) {
            await deleteConfig(rows[key].id);
          }
        }),
        latestAndroidVersion
          ? updateVersion(latestAndroidVersion.id, versionPayload)
          : createVersion(versionPayload),
      ]);

      const publishedVersion = await fetchLatestVersion({ platform: "android" });
      if (!publishedVersion || publishedVersion.version !== version || publishedVersion.buildNo !== buildNo) {
        throw new Error("公开接口返回的版本信息与刚保存的内容不一致");
      }

      message.success("关于我们与版本信息已发布");
      await load();
    } catch (error) {
      message.error(getRequestErrorMessage(error, "关于我们内容保存失败"));
    } finally {
      setSaving(null);
    }
  };

  const deleteAbout = async () => {
    const existingRows = ABOUT_CONFIG_FIELDS.map(({ key }) => rows[key]).filter(Boolean);
    if (!existingRows.length) return;
    try {
      await Promise.all(existingRows.map((row) => deleteConfig(row.id)));
      message.success("已恢复 App 内置关于我们内容");
      await load();
    } catch (error) {
      message.error(getRequestErrorMessage(error, "删除失败"));
    }
  };

  const hasAboutConfig = ABOUT_CONFIG_FIELDS.some(({ key }) => Boolean(rows[key]));

  return (
    <Spin spinning={loading}>
      <div className="app-content-manager">
        <Segmented<ContentMode>
          value={mode}
          options={[
            { value: "privacy", label: "隐私与安全" },
            { value: "about", label: "关于我们" },
          ]}
          onChange={setMode}
        />

        <div hidden={mode !== "privacy"}>
          <Form
            form={privacyForm}
            layout="vertical"
            requiredMark={false}
            initialValues={DEFAULT_PRIVACY_CONTENT}
            className="app-content-form"
          >
            <div className="app-content-heading">
              <Typography.Title level={4}>隐私与安全页面</Typography.Title>
              <Space wrap>
                <Popconfirm
                  title="删除后台配置并恢复 App 内置内容？"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={deletePrivacy}
                  disabled={!rows[PRIVACY_CONFIG_KEY]}
                >
                  <Button danger disabled={!rows[PRIVACY_CONFIG_KEY]} icon={<Trash2 size={16} />}>恢复默认</Button>
                </Popconfirm>
                <Button type="primary" loading={saving === "privacy"} icon={<Save size={16} />} onClick={savePrivacy}>保存发布</Button>
              </Space>
            </div>

            <div className="app-content-grid">
              <Form.Item name="eyebrow" label="页面标签" rules={[{ required: true, message: "请输入页面标签" }]}>
                <Input maxLength={32} />
              </Form.Item>
              <Form.Item name="title" label="页面标题" rules={[{ required: true, message: "请输入页面标题" }]}>
                <Input maxLength={64} />
              </Form.Item>
            </div>
            <Form.Item name="summary" label="说明摘要" rules={[{ required: true, message: "请输入说明摘要" }]}>
              <Input.TextArea rows={3} maxLength={500} showCount />
            </Form.Item>

            <div className="app-content-section-title">
              <Typography.Title level={5}>内容段落</Typography.Title>
            </div>
            <Form.List name="sections">
              {(fields, { add, remove, move }) => (
                <div className="app-content-section-list">
                  {fields.map((field, index) => (
                    <section className="app-content-section-editor" key={field.key}>
                      <Form.Item name={[field.name, "id"]} hidden><Input /></Form.Item>
                      <div className="app-content-section-header">
                        <Typography.Text strong>段落 {index + 1}</Typography.Text>
                        <Space size={4}>
                          <Tooltip title="上移">
                            <Button
                              aria-label="上移段落"
                              icon={<ArrowUp size={16} />}
                              disabled={index === 0}
                              onClick={() => move(index, index - 1)}
                            />
                          </Tooltip>
                          <Tooltip title="下移">
                            <Button
                              aria-label="下移段落"
                              icon={<ArrowDown size={16} />}
                              disabled={index === fields.length - 1}
                              onClick={() => move(index, index + 1)}
                            />
                          </Tooltip>
                          <Popconfirm title="删除这个内容段落？" okText="删除" cancelText="取消" onConfirm={() => remove(field.name)}>
                            <Button aria-label="删除段落" danger icon={<Trash2 size={16} />} />
                          </Popconfirm>
                        </Space>
                      </div>
                      <Form.Item name={[field.name, "title"]} label="段落标题" rules={[{ required: true, message: "请输入段落标题" }]}>
                        <Input maxLength={80} />
                      </Form.Item>
                      <Form.Item name={[field.name, "body"]} label="段落正文" rules={[{ required: true, message: "请输入段落正文" }]}>
                        <Input.TextArea rows={5} maxLength={3000} showCount />
                      </Form.Item>
                    </section>
                  ))}
                  <Button type="dashed" block icon={<Plus size={16} />} onClick={() => add({ title: "", body: "" })}>
                    添加内容段落
                  </Button>
                </div>
              )}
            </Form.List>
          </Form>
        </div>
        <div hidden={mode !== "about"}>
          <Form
            form={aboutForm}
            layout="vertical"
            requiredMark={false}
            initialValues={DEFAULT_ABOUT_CONTENT}
            className="app-content-form"
          >
            <div className="app-content-heading">
              <Typography.Title level={4}>关于我们页面</Typography.Title>
              <Space wrap>
                <Popconfirm
                  title="删除后台配置并恢复 App 内置内容？"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={deleteAbout}
                  disabled={!hasAboutConfig}
                >
                  <Button danger disabled={!hasAboutConfig} icon={<Trash2 size={16} />}>恢复默认</Button>
                </Popconfirm>
                <Button type="primary" loading={saving === "about"} icon={<Save size={16} />} onClick={saveAbout}>保存发布</Button>
              </Space>
            </div>

            <div className="app-content-grid">
              <Form.Item name="appName" label="应用名称" rules={[{ required: true, message: "请输入应用名称" }]}>
                <Input maxLength={64} />
              </Form.Item>
              <Form.Item name="company" label="团队名称" rules={[{ required: true, message: "请输入团队名称" }]}>
                <Input maxLength={128} />
              </Form.Item>
            </div>
            <Form.Item name="description" label="应用简介" rules={[{ required: true, message: "请输入应用简介" }]}>
              <Input.TextArea rows={4} maxLength={1000} showCount />
            </Form.Item>

            <div className="app-content-section-title">
              <Typography.Title level={5}>版本信息</Typography.Title>
            </div>
            <div className="app-content-grid">
              <Form.Item name="version" label="当前版本" rules={[{ required: true, whitespace: true, message: "请输入当前版本" }]}>
                <Input placeholder="例如 1.0.0" maxLength={32} />
              </Form.Item>
              <Form.Item name="buildNo" label="构建号" rules={[{ required: true, message: "请输入构建号" }]}>
                <InputNumber min={1} precision={0} style={{ width: "100%" }} />
              </Form.Item>
            </div>
            <Form.Item name="changelog" label="更新说明">
              <Input.TextArea rows={3} maxLength={2000} showCount />
            </Form.Item>

            <div className="app-content-section-title">
              <Typography.Title level={5}>联系与协议</Typography.Title>
            </div>
            <div className="app-content-grid">
              <Form.Item name="website" label="官网地址" rules={[URL_RULE]}>
                <Input type="url" />
              </Form.Item>
              <Form.Item name="contactEmail" label="联系邮箱" rules={[{ type: "email", message: "请输入有效邮箱" }]}>
                <Input type="email" />
              </Form.Item>
              <Form.Item name="privacyUrl" label="隐私政策地址" rules={[URL_RULE]}>
                <Input type="url" />
              </Form.Item>
              <Form.Item name="termsUrl" label="用户协议地址" rules={[URL_RULE]}>
                <Input type="url" />
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </Spin>
  );
}
