import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config/env";
import {
  AUTH_EXPIRED_EVENT,
  clearAuthSession,
  getAccessToken,
  saveAuthSession,
} from "@/auth/session";
import type { LoginResponse } from "@/types/auth";

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let refreshPromise: Promise<LoginResponse> | null = null;

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = httpClient
      .post<LoginResponse>("/auth/refresh")
      .then((response) => {
        saveAuthSession({ token: response.data.token, user: response.data.user });
        return response.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function refreshAccessToken() {
  return refreshSession().then((session) => session.token);
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestConfig = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const requestUrl = String(requestConfig?.url ?? "");

    if (
      error.response?.status !== 401 ||
      !requestConfig ||
      requestConfig._retry ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    requestConfig._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
      return httpClient(requestConfig);
    } catch (refreshError) {
      clearAuthSession();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      return Promise.reject(refreshError);
    }
  },
);
