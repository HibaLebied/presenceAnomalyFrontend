import type {
  Anomaly,
  AnomalySearchParams,
  DashboardSummary,
  DepartmentStats,
  PageResponse,
  SupervisorDetails,
  SupervisorSummary,
  SynchronizationStatusResponse,
} from "@/types";
import type { AuthenticatedUser, LoginResponse } from "@/types/auth";
import { httpClient, refreshSession } from "@/services/httpClient";

export const hrApi = {
  async login(email: string, password: string) {
    const response = await httpClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async refresh() {
    return refreshSession();
  },

  async logout() {
    await httpClient.post("/auth/logout");
  },

  async getCurrentUser() {
    const response = await httpClient.get<AuthenticatedUser>("/auth/me");
    return response.data;
  },

  async getDashboard(params?: Pick<AnomalySearchParams, "year" | "month" | "hierarchy">) {
    const response = await httpClient.get<DashboardSummary>("/dashboard", { params });
    return response.data;
  },

  async getDepartments(params?: Pick<AnomalySearchParams, "year" | "month" | "hierarchy">) {
    const response = await httpClient.get<DepartmentStats[]>("/departments", { params });
    return response.data;
  },

  async getSupervisors(params?: { department?: string; year?: number; month?: number; hierarchy?: 1 | 2; page?: number; size?: number; sort?: string }) {
    const response = await httpClient.get<PageResponse<SupervisorSummary>>("/supervisors", { params });
    return response.data;
  },

  async getSupervisorDetails(id: string, params?: Pick<AnomalySearchParams, "year" | "month" | "hierarchy">) {
    const response = await httpClient.get<SupervisorDetails>(`/supervisors/${encodeURIComponent(id)}`, { params });
    return response.data;
  },

  async getAnomalies(params?: AnomalySearchParams) {
    const response = await httpClient.get<PageResponse<Anomaly>>("/anomalies", { params });
    return response.data;
  },

  async getAvailableYears() {
    const response = await httpClient.get<number[]>("/filters/years");
    return response.data;
  },

  async startSynchronization() {
    const response = await httpClient.post<SynchronizationStatusResponse>("/synchronization/run");
    return response.data;
  },

  async getSynchronizationStatus(id: number) {
    const response = await httpClient.get<SynchronizationStatusResponse>(`/synchronization/${id}`);
    return response.data;
  },

  async ignoreAnomaly(id: number) {
    const response = await httpClient.patch<Anomaly>(`/anomalies/${id}/ignore`);
    return response.data;
  },

  async activateAnomaly(id: number) {
    const response = await httpClient.patch<Anomaly>(`/anomalies/${id}/activate`);
    return response.data;
  },
};

