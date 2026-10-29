import { useEffect, useMemo, useRef } from "react";
import { CalendarDays, LogOut, RefreshCw, Table2, X } from "lucide-react";
import { AnomalyTable } from "@/components/dashboard/AnomalyTable";
import { DelayCard } from "@/components/dashboard/DelayCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SupervisorDetails } from "@/components/dashboard/SupervisorDetails";
import { SupervisorRanking } from "@/components/dashboard/SupervisorRanking";
import forviaFaureciaLogo from "@/assets/forvia-faurecia-logo.png";
import { useDashboardData } from "@/hooks";
import { cn } from "@/utils/cn";
import { isAdminUser } from "@/auth/session";
import type { AuthenticatedUser } from "@/types/auth";
import {
  formatSynchronizationDate,
  toAnomalyRows,
  toDelayGroups,
  toDepartmentMetrics,
  toSupervisorRanking,
} from "@/utils";

const MONTHS = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

type DashboardPageProps = {
  currentUser: AuthenticatedUser;
  onLogout: () => void;
};

export function DashboardPage({ currentUser, onLogout }: DashboardPageProps) {
  const isAdmin = isAdminUser(currentUser);
  const detailSectionRef = useRef<HTMLDivElement>(null);
  const previousSupervisorIdRef = useRef<string | null>(null);
  const {
    activateAnomaly,
    allSupervisorDetails,
    anomalies,
    anomaliesHasMore,
    availableYears,
    clearToast,
    dashboard,
    departments,
    detailsLoading,
    error,
    filters,
    ignoreAnomaly,
    loading,
    loadingMoreAnomalies,
    loadMoreAnomalies,
    selectDepartment,
    selectedDepartment,
    selectedSupervisorId,
    selectHierarchy,
    selectMonth,
    selectSupervisor,
    selectYear,
    supervisorDetails,
    supervisors,
    synchronizationStatus,
    synchronize,
    synchronizing,
    toast,
  } = useDashboardData();

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeoutId = window.setTimeout(clearToast, 4500);
    return () => window.clearTimeout(timeoutId);
  }, [clearToast, toast]);

  useEffect(() => {
    if (!selectedSupervisorId) {
      previousSupervisorIdRef.current = null;
      return;
    }

    if (!supervisorDetails) {
      return;
    }

    if (previousSupervisorIdRef.current === selectedSupervisorId) {
      return;
    }

    previousSupervisorIdRef.current = selectedSupervisorId;
    detailSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedSupervisorId, supervisorDetails]);

  const departmentMetrics = useMemo(
    () => toDepartmentMetrics(departments),
    [departments],
  );
  const supervisorRanking = useMemo(
    () => toSupervisorRanking(supervisors, allSupervisorDetails),
    [allSupervisorDetails, supervisors],
  );
  const delayGroups = useMemo(
    () => toDelayGroups(allSupervisorDetails),
    [allSupervisorDetails],
  );
  const anomalyRows = useMemo(() => toAnomalyRows(anomalies), [anomalies]);
  const hierarchyLabel = filters.hierarchy === 2 ? "MOD" : "MOI";
  const hasData = Boolean((dashboard?.totalAnomalies ?? 0) > 0);

  return (
    <main className="min-h-screen bg-gray-50/50 text-gray-900" id="dashboard">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <a href="#dashboard">
                <img
                  alt="FORVIA Faurecia"
                  className="h-10 w-auto shrink-0 object-contain"
                  src={forviaFaureciaLogo}
                />
              </a>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Tableau de bord des anomalies
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {dashboard?.lastSynchronizationDate ? (
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  <span>
                    Dernière synchronisation ·{" "}
                    <strong className="font-semibold text-gray-700">
                      {formatSynchronizationDate(
                        dashboard.lastSynchronizationDate,
                      )}
                    </strong>
                  </span>
                </div>
              ) : null}
              {isAdmin ? (
                <button
                  className="flex h-11 items-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70"
                  disabled={synchronizing}
                  type="button"
                  onClick={() => void synchronize()}
                >
                  <RefreshCw
                    className={cn(
                      "mr-2 h-4 w-4",
                      synchronizing && "animate-spin",
                    )}
                    aria-hidden="true"
                  />
                  {synchronizing ? "Synchronisation..." : "Synchroniser"}
                </button>
              ) : null}
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {currentUser.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isAdmin ? "Administrateur RH" : "Manager"}
                  </p>
                </div>
                <button
                  aria-label="Se déconnecter"
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                  title="Se déconnecter"
                  type="button"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 text-sm">
              <span className="font-semibold uppercase tracking-wider text-gray-400">
                Année
              </span>
              <select
                className="bg-transparent font-semibold text-gray-900 outline-none"
                value={filters.year ?? ""}
                onChange={(event) =>
                  selectYear(
                    event.target.value ? Number(event.target.value) : undefined,
                  )
                }
              >
                <option value="">Toutes</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 text-sm">
              <span className="font-semibold uppercase tracking-wider text-gray-400">
                Mois
              </span>
              <select
                className="bg-transparent font-semibold text-gray-900 outline-none"
                value={filters.month ?? ""}
                onChange={(event) =>
                  selectMonth(
                    event.target.value ? Number(event.target.value) : undefined,
                  )
                }
              >
                <option value="">Tous</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Hiérarchie
              </span>
              <div className="inline-flex rounded-xl bg-gray-100 p-1">
                <button
                  className={cn(
                    "h-9 rounded-lg px-6 text-sm font-semibold transition",
                    filters.hierarchy === 2
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                  type="button"
                  onClick={() => selectHierarchy(2)}
                >
                  MOD
                </button>
                <button
                  className={cn(
                    "h-9 rounded-lg px-6 text-sm font-semibold transition",
                    filters.hierarchy === 1
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                  type="button"
                  onClick={() => selectHierarchy(1)}
                >
                  MOI
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {toast ? (
          <div
            className={cn(
              "fixed right-6 top-6 z-[60] flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg",
              toast.type === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-red-100 bg-red-50 text-red-700",
            )}
          >
            {toast.message}
            <button type="button" onClick={clearToast} aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 whitespace-pre-line rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {synchronizationStatus ? (
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Statut synchronisation : {synchronizationStatus.status} ·{" "}
            {synchronizationStatus.totalProcessed} lignes traitées
          </div>
        ) : null}

        {loading && !dashboard ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>
        ) : null}

        {!loading && !hasData ? (
          <section className="mb-8 rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <Table2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Aucune anomalie {hierarchyLabel}
            </h2>
            <p className="text-sm text-gray-400">
              Lancez une synchronisation ou ajustez les filtres.
            </p>
          </section>
        ) : null}

        <section className="mb-8 flex gap-3 overflow-x-auto pb-1">
          <KpiCard
            caption={loading ? "chargement" : "Anomalies"}
            featured
            label="TOTAL"
            selected={!selectedDepartment}
            value={dashboard?.totalAnomalies ?? 0}
            onClick={() => selectDepartment(null)}
          />
          {departmentMetrics.map((metric) => (
            <KpiCard
              key={metric.label}
              caption="Anomalies"
              cardColor={metric.cardColor}
              color={metric.color}
              label={metric.label}
              selected={selectedDepartment === metric.label}
              value={metric.value}
              onClick={() => selectDepartment(metric.label)}
            />
          ))}
        </section>

        {filters.hierarchy === 2 ? (
          <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SupervisorRanking
              items={supervisorRanking}
              loading={loading}
              selectedSupervisorId={selectedSupervisorId}
              onSelectSupervisor={selectSupervisor}
            />
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-900">
                Analyse des délais
              </h2>
              <div className="space-y-3">
                {delayGroups.map((group) => (
                  <DelayCard
                    key={group.title}
                    group={group}
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {supervisorDetails && filters.hierarchy === 2 ? (
          <div ref={detailSectionRef} className="scroll-mt-32">
            <SupervisorDetails
              details={supervisorDetails}
              loading={detailsLoading}
              rows={anomalyRows}
              hasMore={anomaliesHasMore}
              onActivate={isAdmin ? (id) => void activateAnomaly(id) : undefined}
              onClose={() => selectSupervisor(null)}
              onIgnore={isAdmin ? (id) => void ignoreAnomaly(id) : undefined}
              loadingMore={loadingMoreAnomalies}
              onLoadMore={() => void loadMoreAnomalies()}
            />
          </div>
        ) : null}

        {filters.hierarchy === 1 && selectedDepartment ? (
          <AnomalyTable
            loading={loading}
            rows={anomalyRows}
            title={`Anomalies ${hierarchyLabel} - ${selectedDepartment}`}
            showSupervisorColumn
            hasMore={anomaliesHasMore}
            onActivate={isAdmin ? (id) => void activateAnomaly(id) : undefined}
            onIgnore={isAdmin ? (id) => void ignoreAnomaly(id) : undefined}
            loadingMore={loadingMoreAnomalies}
            onLoadMore={() => void loadMoreAnomalies()}
          />
        ) : null}
      </div>
    </main>
  );
}



