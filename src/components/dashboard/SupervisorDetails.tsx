import { X } from "lucide-react";
import { AnomalyTable } from "@/components/dashboard/AnomalyTable";
import type {
  AnomalyGridRow,
  SupervisorDetails as SupervisorDetailsData,
} from "@/types";

type SupervisorDetailsProps = {
  details: SupervisorDetailsData;
  rows: AnomalyGridRow[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onActivate?: (id: number) => void;
  onClose: () => void;
  onIgnore?: (id: number) => void;
  onLoadMore?: () => void;
};

function categoryCount(details: SupervisorDetailsData, token: string) {
  return (
    details.delayCategories.find((category) =>
      category.category.includes(token),
    )?.anomalyCount ?? 0
  );
}

export function SupervisorDetails({
  details,
  rows,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onActivate,
  onClose,
  onIgnore,
  onLoadMore,
}: SupervisorDetailsProps) {
  return (
    <section className="supervisor-detail-enter mt-6 rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Superviseur : {details.supervisorId}
          </h2>
          <p className="mt-0.5 text-sm text-gray-400">
            {loading
              ? "Chargement..."
              : `${details.totalAnomalies} anomalies au total`}
          </p>
        </div>
        <button
          aria-label="Fermer"
          className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100"
          type="button"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          <span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
          &lt;= 1j{" "}
          <strong className="text-sm font-bold">
            {categoryCount(details, "1")}
          </strong>
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
          <span className="h-3.5 w-3.5 rounded-full bg-amber-500" />
          2-9j{" "}
          <strong className="text-sm font-bold">
            {categoryCount(details, "2")}
          </strong>
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
          <span className="h-3.5 w-3.5 rounded-full bg-red-500" />
          &gt;= 10j{" "}
          <strong className="text-sm font-bold">
            {categoryCount(details, "10")}
          </strong>
        </span>
      </div>

      <AnomalyTable
        loading={loading}
        rows={rows}
        title="Anomalies superviseur"
        onActivate={onActivate}
        onIgnore={onIgnore}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
      />
    </section>
  );
}
