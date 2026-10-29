import type { DepartmentColor } from "@/utils/departmentColors";

export type DepartmentMetric = {
  label: string;
  value: number;
  color: string;
  cardColor: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
};

export type SupervisorRank = {
  rank: number;
  name: string;
  department: string;
  total: number;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  width: number;
};

export type DelayGroup = {
  title: string;
  total: number;
  tone: "green" | "amber" | "red";
  rows: Array<{
    supervisor: string;
    count: number;
  }>;
};

export type AnomalyGridRow = {
  id: number;
  departmentColor: DepartmentColor;
  matricule: string;
  employee: string;
  supervisor: string;
  department: string;
  type: string;
  date: string;
  delay: number;
  status: string;
};






