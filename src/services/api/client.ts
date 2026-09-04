import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "./types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
let accessTokenProvider: () => string | null = () => null;

/** Auth context installs the current Supabase access-token reader here. */
export function setAccessTokenProvider(provider: () => string | null): void {
  accessTokenProvider = provider;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = accessTokenProvider();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("yojanasetu:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiError>(error)) return error instanceof Error ? error.message : "An unexpected error occurred.";
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => `${item.loc.join(".")}: ${item.msg}`).join(" | ");
  if (error.response?.status === 401) return "Your session has expired. Please sign in again.";
  if (error.response?.status === 404) return "The requested resource was not found.";
  if (error.response?.status === 422) return "Some information needs to be corrected.";
  if (error.response?.status === 500) return "The service is temporarily unavailable. Please try again later.";
  return BASE_URL ? "Unable to reach the service. Please try again." : "The backend address has not been configured.";
}
