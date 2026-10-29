import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EyeOff, Search } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import type { AnomalyGridRow } from "@/types";
import { cn, formatDate } from "@/utils";

type AnomalyTableProps = {
  title: string;
  rows: AnomalyGridRow[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onActivate?: (id: number) => void;
  onIgnore?: (id: number) => void;
  onLoadMore?: () => void;
  showSupervisorColumn?: boolean;
};

export function AnomalyTable({
  title,
  rows,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onActivate,
  onIgnore,
  onLoadMore,
  showSupervisorColumn = false,
}: AnomalyTableProps) {
  const canManage = Boolean(onActivate || onIgnore);
  const [searchFilter, setSearchFilter] = useState("");
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const gridApiRef = useRef<GridApi<AnomalyGridRow> | null>(null);
  const lastActionRowIdRef = useRef<number | null>(null);
  const lastScrollTopRef = useRef<number | null>(null);

  const bodyViewport = useCallback(() => {
    return gridContainerRef.current?.querySelector<HTMLDivElement>(
      ".ag-body-viewport",
    );
  }, []);

  const rememberGridPosition = useCallback(
    (rowId: number) => {
      lastActionRowIdRef.current = rowId;
      lastScrollTopRef.current = bodyViewport()?.scrollTop ?? null;
    },
    [bodyViewport],
  );

  const columnDefs = useMemo<ColDef<AnomalyGridRow>[]>(
    () => [
      { field: "matricule", headerName: "MATRICULE", flex: 1, sortable: true },
      { field: "employee", headerName: "EMPLOYÉ", flex: 1.35, sortable: true },
      ...(showSupervisorColumn
        ? [
            {
              field: "supervisor",
              headerName: "N+1",
              flex: 1.25,
              sortable: true,
            } satisfies ColDef<AnomalyGridRow>,
          ]
        : []),
      {
        field: "department",
        headerName: "DÉPARTEMENT",
        flex: 1.15,
        sortable: true,
        cellRenderer: ({
          data,
          value,
        }: {
          data?: AnomalyGridRow;
          value: string;
        }) => (
          <span
            className="inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: data?.departmentColor.backgroundColor,
              borderColor: data?.departmentColor.borderColor,
              color: data?.departmentColor.textColor,
            }}
          >
            {value}
          </span>
        ),
      },
      {
        field: "date",
        headerName: "DATE ANOMALIE",
        flex: 1.15,
        sortable: true,
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: "delay",
        headerName: "DÉLAI (J)",
        flex: 0.8,
        sortable: true,
        cellRenderer: ({ value }: { value: number }) => (
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
              value >= 10
                ? "bg-red-100 text-red-700"
                : value <= 1
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700",
            )}
          >
            {value}
          </span>
        ),
      },
      {
        field: "type",
        headerName: "TYPE ANOMALIE",
        flex: 1.7,
        sortable: true,
      },
      ...(canManage
        ? [
            {
              colId: "actions",
              headerName: "ACTIONS",
              flex: 0.65,
              sortable: false,
              cellRenderer: ({ data }: { data?: AnomalyGridRow }) => {
                if (!data) {
                  return null;
                }

                const isIgnored = data.status === "IGNORED";

                return (
                  <button
                    aria-label={isIgnored ? "Réactiver" : "Ignorer"}
                    className={cn(
                      "rounded-lg p-2 transition",
                      isIgnored
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
                    )}
                    title={isIgnored ? "Réactiver l'anomalie" : "Ignorer l'anomalie"}
                    type="button"
                    onClick={() => {
                      rememberGridPosition(data.id);
                      if (isIgnored) {
                        onActivate?.(data.id);
                      } else {
                        onIgnore?.(data.id);
                      }
                    }}
                  >
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  </button>
                );
              },
            } satisfies ColDef<AnomalyGridRow>,
          ]
        : []),
    ],
    [canManage, onActivate, onIgnore, rememberGridPosition, showSupervisorColumn],
  );

  const filteredRows = useMemo(() => {
    const search = searchFilter.trim().toLowerCase();

    if (!search) {
      return rows;
    }

    return rows.filter((row) =>
      [
        row.matricule,
        row.employee,
        row.department,
        row.supervisor,
        row.type,
        row.date,
        String(row.delay),
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }, [rows, searchFilter]);

  const activeResultCount = useMemo(
    () => filteredRows.filter((row) => row.status !== "IGNORED").length,
    [filteredRows],
  );

  useLayoutEffect(() => {
    const rowId = lastActionRowIdRef.current;
    const api = gridApiRef.current;
    const scrollTop = lastScrollTopRef.current;

    if (!rowId || !api) {
      return;
    }

    window.requestAnimationFrame(() => {
      const viewport = bodyViewport();
      if (viewport && scrollTop !== null) {
        viewport.scrollTop = scrollTop;
      }

      const rowNode = api.getRowNode(String(rowId));
      if (rowNode?.rowIndex !== null && rowNode?.rowIndex !== undefined) {
        api.ensureIndexVisible(rowNode.rowIndex);
      }
    });
  }, [bodyViewport, filteredRows, loading]);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-900">
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {loading ? "Chargement..." : `${activeResultCount} résultats`}
          </p>
        </div>
        <label className="relative h-10 min-w-[260px] max-w-sm flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            className="h-full w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-blue-300"
            placeholder="Rechercher..."
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.target.value)}
          />
        </label>
      </div>

      <div
        ref={gridContainerRef}
        className="ag-theme-quartz dashboard-grid h-[430px] overflow-hidden rounded-xl border border-gray-100"
      >
        <AgGridReact<AnomalyGridRow>
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            resizable: false,
            suppressMovable: true,
          }}
          domLayout="normal"
          getRowId={({ data }) => String(data.id)}
          headerHeight={42}
          loading={loading}
          noRowsOverlayComponent={() => (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Aucun rÃ©sultat
            </div>
          )}
          onGridReady={({ api }) => {
            gridApiRef.current = api;
          }}
          rowData={filteredRows}
          rowHeight={48}
          suppressCellFocus
          suppressScrollOnNewData
        />
      </div>

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loadingMore}
            type="button"
            onClick={onLoadMore}
          >
            {loadingMore ? "Chargement..." : "Charger plus d'anomalies"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

