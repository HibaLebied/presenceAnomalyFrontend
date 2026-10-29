import { Clock3 } from "lucide-react";
import type { DelayGroup } from "@/types";
import { cn } from "@/utils/cn";

const toneClasses = {
  green: {
    card: "border-emerald-100 bg-emerald-50",
    icon: "text-emerald-500",
    title: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  amber: {
    card: "border-amber-100 bg-amber-50",
    icon: "text-amber-500",
    title: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  red: {
    card: "border-red-100 bg-red-50",
    icon: "text-red-500",
    title: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
};

type DelayCardProps = {
  group: DelayGroup;
  loading?: boolean;
};

export function DelayCard({ group, loading = false }: DelayCardProps) {
  const tone = toneClasses[group.tone];

  return (
    <section className={cn("rounded-2xl border p-5", tone.card)}>
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider",
            tone.title,
          )}
        >
          <Clock3 className={cn("h-4 w-4", tone.icon)} aria-hidden="true" />
          {group.title}
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold",
            tone.badge,
          )}
        >
          {group.total}
        </span>
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="h-5 animate-pulse rounded bg-white/60" />
        ) : null}
        {!loading && group.rows.length === 0 ? (
          <div className="text-sm text-gray-400">Aucune anomalie</div>
        ) : null}
        {group.rows.slice(0, 8).map((row) => (
          <div
            key={`${group.title}-${row.supervisor}`}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="max-w-[60%] truncate text-gray-700">
              {row.supervisor}
            </span>
            <span className="font-semibold text-gray-900">{row.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
