export type DepartmentStats = {
  department: string;
  anomalyCount: number;
};

export type SupervisorSummary = {
  supervisorId: string;
  anomalyCount: number;
};

export type DelayCategory = {
  category: string;
  anomalyCount: number;
};

export type SupervisorDetails = {
  supervisorId: string;
  totalAnomalies: number;
  departments: string[];
  delayCategories: DelayCategory[];
};

export type DashboardSummary = {
  totalAnomalies: number;
  lastSynchronizationDate: string | null;
  departmentStatistics: DepartmentStats[];
  supervisorRankingSummary: SupervisorSummary[];
};
