import type { SupervisorRank } from "@/types";

type SupervisorRankingProps = {
  items: SupervisorRank[];
  loading?: boolean;
  selectedSupervisorId?: string | null;
  onSelectSupervisor?: (supervisorId: string) => void;
};

export function SupervisorRanking({
  items,
  loading = false,
  selectedSupervisorId,
  onSelectSupervisor,
}: SupervisorRankingProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-900">
        Anomalies par N+1{" "}
      </h2>
      <div className="space-y-1">
        {loading ? (
          <div className="h-12 animate-pulse rounded-lg bg-gray-50" />
        ) : null}
        {!loading && items.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-400">
            Aucune donnée
          </div>
        ) : null}
        {items.map((item) => (
          <button
            key={item.name}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-gray-50/70 ${
              selectedSupervisorId === item.name ? "bg-gray-50" : ""
            }`}
            type="button"
            onClick={() => onSelectSupervisor?.(item.name)}
          >
            <span className="w-5 text-center text-xs font-medium tabular-nums text-gray-300">
              {item.rank}
            </span>
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900">
                {item.name}
              </div>
              <div
                className="truncate text-xs font-medium"
                style={{ color: item.textColor }}
              >
                {item.department}
              </div>
            </div>
            <div className="hidden h-1 w-20 rounded-full bg-gray-100 sm:block">
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{ width: `${item.width}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="w-6 text-right text-sm font-semibold tabular-nums text-gray-900">
              {item.total}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
