import axios from "axios";

const TOKEN_KEY = "emo_admin_token";
const REFRESH_KEY = "emo_admin_refresh";
const PROFILE_KEY = "emo_admin_profile";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 15000,
});

function camelCaseKey(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function normalizeResponseData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeResponseData(item)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        camelCaseKey(key),
        normalizeResponseData(item),
      ]),
    ) as T;
  }
  return value;
}

// ---------- 请求日志 ----------
apiClient.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 登录接口日志不记录明文密码。
  if (config.url?.includes("/login")) {
    const requestData =
      config.data && typeof config.data === "object" && "password" in config.data
        ? { ...config.data, password: "[REDACTED]" }
        : config.data;
    console.log("[req]", config.method?.toUpperCase(), config.baseURL + config.url, requestData);
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    const body = normalizeResponseData(res.data);
    res.data = body;
    // 登录/刷新接口只记录状态，避免把令牌写入控制台。
    const url = res.config.url || "";
    if (url.includes("/login") || url.includes("/refresh")) {
      console.log("[res]", res.status, url);
    }
    if (body && typeof body === "object" && "code" in body && body.code === 0) {
      // 只在业务成功时解包，避免将 null / 错误信息覆盖 res.data
      if ("data" in body) {
        res.data = body.data;
      }
    }
    return res;
  },
  async (error) => {
    const original = error.config;
    const requestURL = original?.url || "";
    const isAuthenticationRequest =
      requestURL.includes("/v1/users/login") || requestURL.includes("/v1/auth/refresh");
    // 打印所有错误，方便排查
    console.error("[err]", error.response?.status, original?.url, error.response?.data || error.message);

    // 登录失败应由登录页显示错误；只有受保护接口的 401 才尝试刷新令牌或跳转。
    if (error.response?.status === 401 && original && !original._retry && !isAuthenticationRequest) {
      original._retry = true;
      const refresh = readRefreshToken();
      if (refresh) {
        try {
          const resp = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || ""}/v1/auth/refresh`,
            { refreshToken: refresh },
          );
          let body = normalizeResponseData(resp.data);
          if (body && typeof body === "object" && "code" in body && body.code === 0 && "data" in body) {
            body = body.data;
          }
          saveToken(body.accessToken);
          saveRefreshToken(body.refreshToken);
          original.headers.Authorization = `Bearer ${body.accessToken}`;
          return apiClient(original);
        } catch (refreshErr) {
          console.error("[err] refresh token 也失败了", refreshErr);
          clearSession();
          sessionStorage.setItem("auth:redirect", "session_expired");
          window.location.href = "/login";
        }
      } else {
        console.error("[err] 401 且无 refresh token，跳转登录");
        clearSession();
        sessionStorage.setItem("auth:redirect", "no_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveRefreshToken(token: string) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function readRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function saveProfile(profile: unknown) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function readProfile<T = unknown>(): T | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
