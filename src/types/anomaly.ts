export type Anomaly = {
  id: number;
  employeeId: string;
  employeeName: string;
  supervisorId: string;
  department: string;
  attendanceDate: string;
  hierarchyCode: number;
  hierarchyLabel: "MOI" | "MOD" | string;
  anomalyTypeCode: string;
  anomalyTypeName: string;
  status: "ACTIVE" | "IGNORED" | string;
  entry1: number | null;
  exit1: number | null;
  entry2: number | null;
  exit2: number | null;
  entry3: number | null;
  exit3: number | null;
  synchronizedAt: string;
  delayDays: number;
};

export type AnomalySearchParams = {
  employeeId?: string;
  employeeName?: string;
  department?: string;
  supervisorId?: string;
  year?: number;
  month?: number;
  hierarchy?: 1 | 2;
  includeIgnored?: boolean;
  page?: number;
  size?: number;
  sort?: string;
};

export type SynchronizationStatus =
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL_SUCCESS";

export type SynchronizationStatusResponse = {
  synchronizationId: number;
  status: SynchronizationStatus;
  startTime: string;
  endTime: string | null;
  lastSyncTime: string | null;
  recordsInserted: number;
  recordsUpdated: number;
  totalProcessed: number;
  errorMessage: string | null;
};
