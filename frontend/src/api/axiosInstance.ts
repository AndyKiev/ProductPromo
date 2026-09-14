import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import { useTranslationsStore } from '../store/useTranslationsStore';
import { translate } from '../hooks/useString';

export class ApiError extends Error {
  constructor(message: string, public message_key?: string, public params?: Record<string, unknown>, public lang_id?: number) {
    super(message); this.name = 'ApiError';
  }
}

const getAuthToken = (): string | null => useAuthStore.getState().access_token;
const getRefreshToken = (): string | null => useAuthStore.getState().refresh_token;

const clearAuthAndRedirect = (): void => {
  useAuthStore.getState().logout();
  if (window.location.pathname !== "/auth/login") {
    window.location.href = "/auth/login";
  }
};

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL ?? "",
  headers: { "Content-Type": "application/json;charset=utf-8" },
  timeout: 30_000,
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (error: unknown, token: string | null): void => {
  pendingQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  pendingQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(translate('notAuthenticated'), 'notAuthenticated');
  const { data } = await refreshClient.post<{
    access_token: string;
    refresh_token: string;
  }>("/api/v1/jwt/refresh", { refresh_token: refreshToken }, {
    headers: { 'X-Lang-Id': useTranslationsStore.getState().selected?.id },
  });
  useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
  return data.access_token;
};

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL ?? "",
  headers: { "Content-Type": "application/json;charset=utf-8" },
  withCredentials: false,
  timeout: 30_000,
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const langId = useTranslationsStore.getState().selected?.id;
    if (langId) config.headers['X-Lang-Id'] = langId;
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? "";
    const isAuthCall = url.includes("/jwt/login") || url.includes("/jwt/refresh");

    if (status === 401 && originalRequest && !isAuthCall) {
      if (originalRequest._retry) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
      if (!getRefreshToken()) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        flushQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const body = error.response?.data as { detail?: unknown; message_key?: string; params?: Record<string, unknown>; lang_id?: number; errors?: { msg: string }[] } | undefined;
    const detail = body?.detail;
    if (body?.message_key) {
      const text = body.errors?.map((e) => e.msg).join('; ') || (typeof detail === 'string' ? detail : translate(body.message_key, body.params));
      return Promise.reject(new ApiError(text, body.message_key, body.params, body.lang_id));
    }
    if (detail) {
      if (typeof detail === "string") {
        return Promise.reject(new Error(detail));
      }
      if (Array.isArray(detail)) {
        const messages = detail
          .map((d: { msg?: string }) => d.msg)
          .filter(Boolean)
          .join("; ");
        return Promise.reject(new ApiError(messages || translate('validationFailed')));
      }
      return Promise.reject(new Error(String(detail)));
    }
    return Promise.reject(new ApiError(translate(error.code === 'ECONNABORTED' ? 'requestTimeout' : 'networkError')));
  },
);

export const axiosInstance = instance;
