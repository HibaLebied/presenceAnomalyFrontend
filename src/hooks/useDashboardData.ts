import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { hrApi } from "@/services";
import type {
  Anomaly,
  AnomalySearchParams,
  DashboardSummary,
  DepartmentStats,
  SupervisorDetails,
  SupervisorSummary,
  SynchronizationStatusResponse,
} from "@/types";

export type HierarchyFilter = 1 | 2;

const CURRENT_YEAR = new Date().getFullYear();
const ANOMALY_PAGE_SIZE = 100;

type DashboardFilters = {
  year?: number;
  month?: number;
  hierarchy: HierarchyFilter;
};

type DashboardState = {
  dashboard: DashboardSummary | null;
  availableYears: number[];
  departments: DepartmentStats[];
  supervisors: SupervisorSummary[];
  supervisorDetails: SupervisorDetails | null;
  allSupervisorDetails: SupervisorDetails[];
  anomalies: Anomaly[];
  anomaliesHasMore: boolean;
  anomaliesPage: number;
  loadingMoreAnomalies: boolean;
  loading: boolean;
  detailsLoading: boolean;
  synchronizing: boolean;
  synchronizationStatus: SynchronizationStatusResponse | null;
  error: string | null;
  toast: { type: "success" | "error"; message: string } | null;
};

const initialState: DashboardState = {
  dashboard: null,
  availableYears: [],
  departments: [],
  supervisors: [],
  supervisorDetails: null,
  allSupervisorDetails: [],
  anomalies: [],
  anomaliesHasMore: false,
  anomaliesPage: 0,
  loadingMoreAnomalies: false,
  loading: true,
  detailsLoading: false,
  synchronizing: false,
  synchronizationStatus: null,
  error: null,
  toast: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function firstString(values: unknown[]): string | null {
  return (
    values.find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    ) ?? null
  );
}

function responseErrorMessage(data: unknown): string | null {
  if (typeof data === "string" && data.trim().length > 0) {
    return data;
  }

  if (!isRecord(data)) {
    return null;
  }

  if (Array.isArray(data.errors)) {
    const messages: string[] = data.errors
      .map((item) => responseErrorMessage(item))
      .filter((message): message is string => Boolean(message));
    if (messages.length > 0) {
      return messages.join("\n");
    }
  }

  if (isRecord(data.validationErrors)) {
    const validationMessage = firstString(Object.values(data.validationErrors));
    if (validationMessage) {
      return validationMessage;
    }
  }

  const directMessage = firstString([
    data.message,
    data.detail,
    data.error,
    data.title,
  ]);
  if (directMessage) {
    return directMessage;
  }

  return null;
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseMessage = responseErrorMessage(error.response?.data);
    return responseMessage ?? error.message;
  }

  return error instanceof Error ? error.message : "Erreur inattendue";
}

function requestParams(filters: DashboardFilters) {
  return {
    year: filters.year,
    month: filters.month,
    hierarchy: filters.hierarchy,
  } satisfies Pick<AnomalySearchParams, "year" | "month" | "hierarchy">;
}

function syncFinished(status: SynchronizationStatusResponse) {
  return status.status !== "RUNNING";
}

function replaceAnomaly(anomalies: Anomaly[], updated: Anomaly) {
  return anomalies.map((anomaly) =>
    anomaly.id === updated.id ? updated : anomaly,
  );
}

function validSupervisors(supervisors: SupervisorSummary[]) {
  return supervisors.filter(
    (supervisor) =>
      supervisor.supervisorId && supervisor.supervisorId.trim().length > 0,
  );
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<DashboardFilters>({ hierarchy: 2 });

  const load = useCallback(async () => {
    const params = requestParams(filters);

    setState((current) => ({
      ...current,
      loading: true,
      supervisorDetails: null,
      anomalies: [],
      anomaliesHasMore: false,
      anomaliesPage: 0,
      loadingMoreAnomalies: false,
      error: null,
    }));

    try {
      const [availableYears, dashboard, departments, supervisorsPage, anomaliesPage] =
        await Promise.all([
          hrApi.getAvailableYears(),
          hrApi.getDashboard(params),
          hrApi.getDepartments(params),
          hrApi.getSupervisors({
            ...params,
            department: selectedDepartment ?? undefined,
            page: 0,
            size: 20,
          }),
          hrApi.getAnomalies({
            ...params,
            department: selectedDepartment ?? undefined,
            includeIgnored: true,
            page: 0,
            size: ANOMALY_PAGE_SIZE,
            sort: "attendanceDate,desc",
          }),
        ]);

      const supervisors = validSupervisors(supervisorsPage.content);
      const allSupervisorDetails = await Promise.all(
        supervisors.map((supervisor) =>
          hrApi.getSupervisorDetails(supervisor.supervisorId, params),
        ),
      );

      setState((current) => ({
        dashboard,
        availableYears,
        departments,
        supervisors,
        supervisorDetails: null,
        allSupervisorDetails,
        anomalies: anomaliesPage.content,
        anomaliesHasMore: !anomaliesPage.page.last,
        anomaliesPage: anomaliesPage.page.page,
        loadingMoreAnomalies: false,
        loading: false,
        detailsLoading: false,
        synchronizing: current.synchronizing,
        synchronizationStatus: current.synchronizationStatus,
        error: null,
        toast: current.toast,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        detailsLoading: false,
        synchronizing: false,
        error: errorMessage(error),
      }));
    }
  }, [filters, selectedDepartment]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshCounters = useCallback(async () => {
    const params = requestParams(filters);

    try {
      const [availableYears, dashboard, departments, supervisorsPage] = await Promise.all([
        hrApi.getAvailableYears(),
        hrApi.getDashboard(params),
        hrApi.getDepartments(params),
        hrApi.getSupervisors({
          ...params,
          department: selectedDepartment ?? undefined,
          page: 0,
          size: 20,
        }),
      ]);

      const supervisors = validSupervisors(supervisorsPage.content);
      const [allSupervisorDetails, selectedDetails] = await Promise.all([
        Promise.all(
          supervisors.map((supervisor) =>
            hrApi
              .getSupervisorDetails(supervisor.supervisorId, params)
              .catch(() => null),
          ),
        ),
        selectedSupervisorId
          ? hrApi
              .getSupervisorDetails(selectedSupervisorId, params)
              .catch(() => null)
          : Promise.resolve(null),
      ]);

      setState((current) => ({
        ...current,
        availableYears,
        dashboard,
        departments,
        supervisors,
        allSupervisorDetails: allSupervisorDetails.filter(
          (details): details is SupervisorDetails => Boolean(details),
        ),
        supervisorDetails: selectedSupervisorId
          ? selectedDetails
          : current.supervisorDetails,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: errorMessage(error),
      }));
    }
  }, [filters, selectedDepartment, selectedSupervisorId]);

  useEffect(() => {
    if (!selectedSupervisorId) {
      setState((current) => ({
        ...current,
        supervisorDetails: null,
        detailsLoading: false,
      }));
      return;
    }

    let cancelled = false;
    const supervisorId = selectedSupervisorId;
    const params = requestParams(filters);

    async function loadSupervisorDetails() {
      setState((current) => ({
        ...current,
        detailsLoading: true,
        error: null,
      }));

      try {
        const [supervisorDetails, anomaliesPage] = await Promise.all([
          hrApi.getSupervisorDetails(supervisorId, params),
          hrApi.getAnomalies({
            ...params,
            department: selectedDepartment ?? undefined,
            includeIgnored: true,
            page: 0,
            size: ANOMALY_PAGE_SIZE,
            sort: "attendanceDate,desc",
            supervisorId,
          }),
        ]);

        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          supervisorDetails,
          anomalies: anomaliesPage.content,
          anomaliesHasMore: !anomaliesPage.page.last,
          anomaliesPage: anomaliesPage.page.page,
          loadingMoreAnomalies: false,
          detailsLoading: false,
          error: null,
        }));
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          detailsLoading: false,
          error: errorMessage(error),
        }));
      }
    }

    void loadSupervisorDetails();

    return () => {
      cancelled = true;
    };
  }, [filters, selectedDepartment, selectedSupervisorId]);

  const loadMoreAnomalies = useCallback(async () => {
    if (state.loadingMoreAnomalies || !state.anomaliesHasMore) {
      return;
    }

    const nextPage = state.anomaliesPage + 1;
    const params = requestParams(filters);

    setState((current) => ({
      ...current,
      loadingMoreAnomalies: true,
      error: null,
    }));

    try {
      const anomaliesPage = await hrApi.getAnomalies({
        ...params,
        department: selectedDepartment ?? undefined,
        includeIgnored: true,
        page: nextPage,
        size: ANOMALY_PAGE_SIZE,
        sort: "attendanceDate,desc",
        supervisorId: selectedSupervisorId ?? undefined,
      });

      setState((current) => {
        const existingIds = new Set(current.anomalies.map((anomaly) => anomaly.id));
        const newAnomalies = anomaliesPage.content.filter(
          (anomaly) => !existingIds.has(anomaly.id),
        );

        return {
          ...current,
          anomalies: [...current.anomalies, ...newAnomalies],
          anomaliesHasMore: !anomaliesPage.page.last,
          anomaliesPage: anomaliesPage.page.page,
          loadingMoreAnomalies: false,
        };
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loadingMoreAnomalies: false,
        error: errorMessage(error),
      }));
    }
  }, [
    filters,
    selectedDepartment,
    selectedSupervisorId,
    state.anomaliesHasMore,
    state.anomaliesPage,
    state.loadingMoreAnomalies,
  ]);

  const synchronize = useCallback(async () => {
    setState((current) => ({
      ...current,
      synchronizing: true,
      synchronizationStatus: null,
      error: null,
      toast: null,
    }));

    try {
      const started = await hrApi.startSynchronization();
      setState((current) => ({
        ...current,
        synchronizationStatus: started,
        toast: {
          type: "success",
          message: "Synchronisation lancée",
        },
      }));

      let latest = started;
      while (!syncFinished(latest)) {
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        latest = await hrApi.getSynchronizationStatus(
          started.synchronizationId,
        );
        setState((current) => ({
          ...current,
          synchronizationStatus: latest,
        }));
      }

      setState((current) => ({
        ...current,
        synchronizing: false,
        synchronizationStatus: latest,
        toast:
          latest.status === "SUCCESS" || latest.status === "PARTIAL_SUCCESS"
            ? {
                type: "success",
                message: `Synchronisation terminée : ${latest.totalProcessed} lignes traitées`,
              }
            : {
                type: "error",
                message: latest.errorMessage ?? "Synchronisation échouée",
              },
      }));

      await load();
    } catch (error) {
      setState((current) => ({
        ...current,
        synchronizing: false,
        error: errorMessage(error),
        toast: { type: "error", message: errorMessage(error) },
      }));
    }
  }, [load]);

  const ignoreAnomaly = useCallback(
    async (id: number) => {
      try {
        const updatedAnomaly = await hrApi.ignoreAnomaly(id);
        setState((current) => ({
          ...current,
          anomalies: replaceAnomaly(current.anomalies, updatedAnomaly),
          toast: { type: "success", message: "Anomalie ignorée" },
        }));
        await refreshCounters();
      } catch (error) {
        setState((current) => ({
          ...current,
          error: errorMessage(error),
          toast: { type: "error", message: errorMessage(error) },
        }));
      }
    },
    [refreshCounters],
  );

  const activateAnomaly = useCallback(
    async (id: number) => {
      try {
        const updatedAnomaly = await hrApi.activateAnomaly(id);
        setState((current) => ({
          ...current,
          anomalies: replaceAnomaly(current.anomalies, updatedAnomaly),
          toast: { type: "success", message: "Anomalie réactivée" },
        }));
        await refreshCounters();
      } catch (error) {
        setState((current) => ({
          ...current,
          error: errorMessage(error),
          toast: { type: "error", message: errorMessage(error) },
        }));
      }
    },
    [refreshCounters],
  );

  return useMemo(
    () => ({
      ...state,
      filters,
      selectedDepartment,
      selectedSupervisorId,
      activateAnomaly,
      clearToast: () => setState((current) => ({ ...current, toast: null })),
      ignoreAnomaly,
      loadMoreAnomalies,
      reload: load,
      selectDepartment: (department: string | null) => {
        setSelectedDepartment((current) =>
          current === department ? null : department,
        );
        setSelectedSupervisorId(null);
      },
      selectHierarchy: (hierarchy: HierarchyFilter) => {
        setFilters((current) => ({ ...current, hierarchy }));
        setSelectedDepartment(null);
        setSelectedSupervisorId(null);
      },
      selectMonth: (month?: number) => {
        const latestAvailableYear = state.availableYears[0] ?? CURRENT_YEAR;

        setFilters((current) => ({
          ...current,
          year: month && !current.year ? latestAvailableYear : current.year,
          month,
        }));
        setSelectedSupervisorId(null);
      },
      selectSupervisor: (supervisorId: string | null) => {
        setSelectedSupervisorId((current) =>
          current === supervisorId ? null : supervisorId,
        );
      },
      selectYear: (year?: number) => {
        setFilters((current) => ({
          ...current,
          year,
          month: year ? current.month : undefined,
        }));
        setSelectedSupervisorId(null);
      },
      synchronize,
    }),
    [
      activateAnomaly,
      filters,
      ignoreAnomaly,
      loadMoreAnomalies,
      load,
      selectedDepartment,
      selectedSupervisorId,
      state,
      synchronize,
    ],
  );
}
