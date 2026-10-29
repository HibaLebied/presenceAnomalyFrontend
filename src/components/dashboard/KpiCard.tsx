import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

type KpiCardProps = {
  label: string;
  value: number;
  caption: string;
  color?: string;
  cardColor?: string;
  featured?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export function KpiCard({
  label,
  value,
  caption,
  color = "#3b82f6",
  cardColor = color,
  featured = false,
  selected = false,
  onClick,
}: KpiCardProps) {
  const Component = onClick ? "button" : "section";
  const selectedStyle =
    selected && !featured ? { backgroundColor: cardColor } : undefined;

  return (
    <Component
      className={cn(
        "shrink-0 rounded-2xl border p-5 text-left transition",
        featured ? "min-w-[180px]" : "min-w-[160px]",
        selected
          ? featured
            ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/20"
            : "border-transparent text-white shadow-lg"
          : "border-gray-100 bg-white text-gray-900 shadow-sm hover:border-blue-200",
        onClick && "cursor-pointer",
      )}
      style={selectedStyle}
      type={onClick ? "button" : undefined}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {featured ? (
          <AlertTriangle
            className={cn("h-4 w-4", selected ? "text-white" : "text-red-500")}
            aria-hidden="true"
          />
        ) : (
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            selected ? "text-white/80" : "text-gray-400",
          )}
        >
          {label}
        </span>
      </div>
      <div
        className={cn(
          "mt-5 text-3xl font-bold leading-none tracking-tight",
          selected ? "text-white" : "text-gray-900",
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "mt-2 max-w-[130px] truncate text-xs",
          selected ? "text-white/80" : "text-gray-400",
        )}
      >
        {caption}
      </div>
    </Component>
  );
}
