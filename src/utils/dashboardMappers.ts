import type {
  Anomaly,
  DepartmentMetric,
  DepartmentStats,
  DelayGroup,
  SupervisorDetails,
  SupervisorRank,
  SupervisorSummary,
} from "@/types";
import { getDepartmentColor } from "@/utils/departmentColors";

export function toDepartmentMetrics(
  departments: DepartmentStats[],
): DepartmentMetric[] {
  return departments.map((department) => {
    const colors = getDepartmentColor(department.department);

    return {
      label: department.department,
      value: department.anomalyCount,
      color: colors.color,
      cardColor: colors.cardColor,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      textColor: colors.textColor,
    };
  });
}

export function toSupervisorRanking(
  supervisors: SupervisorSummary[],
  details: SupervisorDetails[] = [],
): SupervisorRank[] {
  const max = Math.max(
    ...supervisors.map((supervisor) => supervisor.anomalyCount),
    1,
  );

  return supervisors.map((supervisor, index) => {
    const department =
      details.find((item) => item.supervisorId === supervisor.supervisorId)
        ?.departments[0] ?? "";
    const colors = getDepartmentColor(department);

    return {
      rank: index + 1,
      name: supervisor.supervisorId,
      department,
      total: supervisor.anomalyCount,
      color: colors.color,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      textColor: colors.textColor,
      width: Math.max(18, Math.round((supervisor.anomalyCount / max) * 100)),
    };
  });
}

function categoryCount(details: SupervisorDetails, token: string) {
  return (
    details.delayCategories.find((category) =>
      category.category.includes(token),
    )?.anomalyCount ?? 0
  );
}

function delayRows(details: SupervisorDetails[], token: string) {
  return details
    .map((item) => ({
      supervisor: item.supervisorId,
      count: categoryCount(item, token),
    }))
    .filter((row) => row.count > 0)
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.supervisor.localeCompare(right.supervisor),
    );
}

export function toDelayGroups(details: SupervisorDetails[] = []): DelayGroup[] {
  return [
    {
      title: "<= 1 JOUR",
      total: details.reduce(
        (total, item) => total + categoryCount(item, "1"),
        0,
      ),
      tone: "green",
      rows: delayRows(details, "1"),
    },
    {
      title: "2 - 9 JOURS",
      total: details.reduce(
        (total, item) => total + categoryCount(item, "2"),
        0,
      ),
      tone: "amber",
      rows: delayRows(details, "2"),
    },
    {
      title: ">= 10 JOURS",
      total: details.reduce(
        (total, item) => total + categoryCount(item, "10"),
        0,
      ),
      tone: "red",
      rows: delayRows(details, "10"),
    },
  ];
}

export function toAnomalyRows(anomalies: Anomaly[]) {
  return anomalies.map((anomaly) => ({
    id: anomaly.id,
    departmentColor: getDepartmentColor(anomaly.department),
    matricule: anomaly.employeeId,
    employee: anomaly.employeeName,
    supervisor: anomaly.supervisorId,
    department: anomaly.department,
    type: anomaly.anomalyTypeName || anomaly.anomalyTypeCode,
    date: anomaly.attendanceDate,
    delay: anomaly.delayDays,
    status: anomaly.status,
  }));
}



