import axios from "axios";

const TOKEN_KEY = "emo_admin_token";
const REFRESH_KEY = "emo_admin_refresh";
const PROFILE_KEY = "emo_admin_profile";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === "object" && "code" in body && "data" in body) {
      res.data = body.data;
    }
    return res;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = readRefreshToken();
      if (refresh) {
        try {
          const resp = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || ""}/v1/auth/refresh`,
            { refreshToken: refresh },
          );
          let body = resp.data;
          if (body && typeof body === "object" && "code" in body && "data" in body) {
            body = body.data;
          }
          saveToken(body.accessToken);
          saveRefreshToken(body.refreshToken);
          original.headers.Authorization = `Bearer ${body.accessToken}`;
          return apiClient(original);
        } catch {
          clearSession();
          window.location.href = "/login";
        }
      } else {
        clearSession();
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
